from __future__ import absolute_import
from celery import shared_task
import pymssql
from faconstor.models import *
from django.db import connection
from xml.dom.minidom import parse, parseString
from . import remote
from .models import *
from .funcs import *
import datetime
from django.db.models import Q
import time


def is_connection_usable():
    try:
        connection.connection.ping()
    except:
        return False
    else:
        return True


def handle_func(jobid, steprunid):
    if not is_connection_usable():
        connection.close()
    try:
        conn = pymssql.connect(host='cv-server\COMMVAULT', user='sa_cloud', password='1qaz@WSX', database='CommServ')
        cur = conn.cursor()
    except:
        print("链接失败!")
    else:
        try:
            cur.execute(
                """SELECT *  FROM [commserv].[dbo].[RunningBackups] where jobid={0}""".format(jobid))
            backup_task_list = cur.fetchall()

            cur.execute(
                """SELECT *  FROM [commserv].[dbo].[RunningRestores] where jobid={0}""".format(jobid))
            restore_task_list = cur.fetchall()
        except:
            print("任务不存在!")  # 1.修改当前步骤状态为DONE
        else:
            # 查询备份/恢复是否报错，将报错信息写入当前Step的operator字段中，并结束当前任务
            if backup_task_list:
                for backup_job in backup_task_list:
                    print("备份进度：", backup_job[42])
                    if backup_job[42] == 100:
                        steprun = StepRun.objects.filter(id=steprunid)
                        steprun = steprun[0]
                        if backup_job["DelayReason"]:
                            steprun.operator = backup_job["DelayReason"]
                            steprun.state = "EDIT"
                            steprun.save()
                            cur.close()
                            conn.close()
                            return
                        else:
                            steprun.state = "DONE"
                            steprun.save()
                            cur.close()
                            conn.close()
                    else:
                        cur.close()
                        conn.close()
                        time.sleep(30)
                        handle_func(jobid, steprunid)
            elif restore_task_list:
                for restore_job in restore_task_list:
                    print("恢复进度：", restore_job[35])
                    if restore_job[35] == 100:
                        steprun = StepRun.objects.filter(id=steprunid)
                        steprun = steprun[0]
                        if restore_job["DelayReason"]:
                            steprun.operator = restore_job["DelayReason"]
                            steprun.save()
                            cur.close()
                            conn.close()
                            return
                        else:
                            steprun.state = "DONE"
                            steprun.save()
                            cur.close()
                            conn.close()
                    else:
                        cur.close()
                        conn.close()
                        time.sleep(30)
                        handle_func(jobid, steprunid)
            else:
                print("当前没有在执行的任务!")
                steprun = StepRun.objects.filter(id=steprunid)
                steprun = steprun[0]
                steprun.state = "DONE"
                steprun.save()


@shared_task
def handle_job(jobid, steprunid):
    """
    根据jobid查询任务状态，每半分钟查询一次，如果完成就在steprun中写入DONE
    """
    handle_func(jobid, steprunid)


# @shared_task(bind=True, default_retry_delay=300, max_retries=5)  # 错误处理机制，因网络延迟等问题的重试；
@shared_task
def exec_script(steprunid, username, fullname):
    """
    执行当前步骤在指定系统下的所有脚本
    """
    end_step_tag = True
    steprun = StepRun.objects.filter(id=steprunid)
    steprun = steprun[0]
    scriptruns = steprun.scriptrun_set.exclude(Q(state__in=("9", "DONE", "IGNORE")) | Q(result=0))
    for script in scriptruns:
        script.starttime = datetime.datetime.now()
        script.result = ""
        script.state = "RUN"
        script.save()
        cmd = r"{0}".format(script.script.scriptpath + script.script.filename)
        ip = script.script.ip
        username = script.script.username
        password = script.script.password
        script_type = script.script.type
        system_tag = ""
        if script_type == "SSH":
            system_tag = "Linux"
        if script_type == "BAT":
            system_tag = "Windows"
        rm_obj = remote.ServerByPara(cmd, ip, username, password, system_tag)  # 服务器系统从视图中传入
        result = rm_obj.run(script.script.succeedtext)

        script.endtime = datetime.datetime.now()
        script.result = result["exec_tag"]
        script.explain = result['data'] if len(result['data']) <= 5000 else result['data'][-4999:]

        # 处理脚本执行失败问题
        if result["exec_tag"] == 1:
            script.runlog = result['log']

            end_step_tag = False
            script.state = "ERROR"
            steprun.state = "ERROR"
            script.save()
            steprun.save()
            break
        script.state = "DONE"
        script.save()

    if end_step_tag:
        steprun.state = "DONE"
        steprun.save()

        task = steprun.processtask_set.filter(state="0")
        if len(task) > 0:
            task[0].endtime = datetime.datetime.now()
            task[0].state = "1"
            task[0].operator = username
            task[0].save()

            nextstep = steprun.step.next.exclude(state="9")
            if len(nextstep) > 0:
                nextsteprun = nextstep[0].steprun_set.exclude(state="9").filter(processrun=steprun.processrun)
                if len(nextsteprun) > 0:
                    mysteprun = nextsteprun[0]
                    myprocesstask = ProcessTask()
                    myprocesstask.processrun = steprun.processrun
                    myprocesstask.steprun = mysteprun
                    myprocesstask.starttime = datetime.datetime.now()
                    myprocesstask.senduser = username
                    myprocesstask.receiveuser = username
                    myprocesstask.type = "RUN"
                    myprocesstask.state = "0"
                    myprocesstask.content = steprun.processrun.DataSet.clientName + "的" + steprun.processrun.process.name + "流程进行到“" + \
                                            nextstep[
                                                0].name + "”，请" + fullname + "处理。"
                    myprocesstask.save()


def run_all_steps(current_step, processrun):
    if current_step.intertype == "complex":
        # 1.执行子流程第一个步骤
        sub_process = current_step.sub_process
        sub_process = Process.objects.filter(id=int(sub_process), state="1")
        if sub_process:
            sub_process = sub_process[0]
            start_step = sub_process.step_set.filter(state="1", intertype__contains="start")[0]
            line_step = \
                sub_process.step_set.filter(state="1", type="lines",
                                            fromnode="demo_node_" + str(start_step.drwaid).zfill(10))[0]
            to_node = line_step.tonode.split("demo_node_")[1]
            if to_node:
                sub_current_step = \
                    sub_process.step_set.filter(state="1", drwaid=int(to_node),
                                                intertype__in=["node", "task", "complex"])[0]
                result = run_all_steps(sub_current_step, processrun)
                if result or result == 0:
                    return result
    else:
        # 2.执行非子流程步骤(当前是一个步骤/子流程下的步骤)
        # 遍历执行所有step_run对象
        c_step_run = StepRun.objects.filter(step=current_step, processrun=processrun)
        if c_step_run.exists():
            c_step_run = c_step_run[0]
            # 判断该步骤是否已完成，如果未完成，先执行当前步骤
            if c_step_run.state != "DONE":
                # 取消任务重试成功后的错误消息展示
                all_done_tasks = ProcessTask.objects.exclude(state="1").filter(processrun_id=processrun.id,
                                                                               type="ERROR")
                for task in all_done_tasks:
                    task.state = "1"
                    task.save()

                c_step_run.starttime = datetime.datetime.now()
                # 将错误状态修改成执行中
                c_step_run.state = "RUN"
                c_step_run.save()

                # 执行脚本
                scriptruns = c_step_run.scriptrun_set.exclude(Q(state__in=("9", "DONE", "IGNORE")) | Q(result=0))
                for script in scriptruns:
                    script.starttime = datetime.datetime.now()
                    script.result = ""
                    script.state = "RUN"
                    script.save()

                    cmd = r"{0}".format(script.script.scriptpath + script.script.filename)
                    ip = script.script.ip
                    username = script.script.username
                    password = script.script.password
                    script_type = script.script.type
                    system_tag = ""
                    if script_type == "SSH":
                        system_tag = "Linux"
                    if script_type == "BAT":
                        system_tag = "Windows"
                    rm_obj = remote.ServerByPara(cmd, ip, username, password, system_tag)  # 服务器系统从视图中传入
                    result = rm_obj.run(script.script.succeedtext)

                    script.endtime = datetime.datetime.now()
                    script.result = result['exec_tag']
                    script.explain = result['data'] if len(result['data']) <= 5000 else result['data'][-4999:]

                    # 处理脚本执行失败问题
                    if result["exec_tag"] == 1:
                        script.runlog = result['log']  # 写入错误类型
                        print("当前脚本执行失败,结束任务!")
                        script.state = "ERROR"
                        script.save()
                        c_step_run.state = "ERROR"
                        c_step_run.save()

                        script_name = script.script.name if script.script.name else ""
                        myprocesstask = ProcessTask()
                        myprocesstask.processrun = c_step_run.processrun
                        myprocesstask.starttime = datetime.datetime.now()
                        myprocesstask.senduser = c_step_run.processrun.creatuser
                        myprocesstask.receiveauth = c_step_run.step.group
                        myprocesstask.type = "ERROR"
                        myprocesstask.state = "0"
                        myprocesstask.content = "脚本" + script_name + "执行错误，请处理。"
                        myprocesstask.steprun_id = c_step_run.id
                        myprocesstask.save()
                        return 0

                    script.endtime = datetime.datetime.now()
                    script.state = "DONE"
                    script.save()

                    script_name = script.script.name if script.script.name else ""

                    myprocesstask = ProcessTask()
                    myprocesstask.processrun = c_step_run.processrun
                    myprocesstask.starttime = datetime.datetime.now()
                    myprocesstask.senduser = c_step_run.processrun.creatuser
                    myprocesstask.type = "INFO"
                    myprocesstask.logtype = "SCRIPT"
                    myprocesstask.state = "1"
                    myprocesstask.content = "脚本" + script_name + "完成。"
                    myprocesstask.save()

                # 待确认
                if c_step_run.step.approval == "1" or c_step_run.verifyitemsrun_set.all():
                    c_step_run.state = "CONFIRM"
                    c_step_run.endtime = datetime.datetime.now()
                    c_step_run.save()

                    steprun_name = c_step_run.step.name if c_step_run.step.name else ""
                    myprocesstask = ProcessTask()
                    myprocesstask.processrun = c_step_run.processrun
                    myprocesstask.starttime = datetime.datetime.now()
                    myprocesstask.senduser = c_step_run.processrun.creatuser
                    myprocesstask.receiveauth = c_step_run.step.group
                    myprocesstask.type = "RUN"
                    myprocesstask.state = "0"
                    task_content = "步骤" + steprun_name + "等待确认，请处理。"
                    myprocesstask.content = task_content
                    myprocesstask.steprun_id = c_step_run.id

                    myprocesstask.save()
                    print("确认了*************************")
                    return 2
                else:
                    c_step_run.state = "DONE"
                    c_step_run.endtime = datetime.datetime.now()
                    c_step_run.save()

                    steprun_name = c_step_run.step.name if c_step_run.step.name else ""
                    myprocesstask = ProcessTask()
                    myprocesstask.processrun = c_step_run.processrun
                    myprocesstask.starttime = datetime.datetime.now()
                    myprocesstask.senduser = c_step_run.processrun.creatuser
                    myprocesstask.type = "INFO"
                    myprocesstask.logtype = "STEP"
                    myprocesstask.state = "1"
                    myprocesstask.content = "步骤" + steprun_name + "完成。"
                    myprocesstask.save()
        # 判断是否有下一步骤
        process = current_step.process
        next_line_step = process.step_set.filter(state="1", fromnode="demo_node_" + str(current_step.drwaid).zfill(10))
        if next_line_step.exists():
            next_line_step = next_line_step[0]
            next_to_node = next_line_step.tonode.split("demo_node_")[1]
            next_step = \
                process.step_set.filter(state="1", drwaid=int(next_to_node), intertype__in=["node", "task", "complex"])
            if next_step:
                next_step = next_step[0]
                result = run_all_steps(next_step, processrun)
                if result or result == 0:
                    return result
            # 没有下一步: 结束/子流程下步骤最后一步，怎么判断是子流程还是结束？有父级的步骤/没父级的步骤
            # 如果是子流程最后一步,找到父级流程的下一步,执行run_all_steps
            else:
                c_process_id = current_step.process.id
                p_complex_step = Step.objects.filter(state="1", intertype="complex", sub_process=str(c_process_id))
                if p_complex_step:
                    p_complex_step = p_complex_step[0]
                    line_step = \
                        p_complex_step.process.step_set.filter(state="1", type="lines",
                                                               fromnode="demo_node_" + str(p_complex_step.drwaid).zfill(
                                                                   10))
                    if line_step:
                        line_step = line_step[0]
                        to_node = line_step.tonode.split("demo_node_")[1]
                        c_step = \
                            p_complex_step.process.step_set.filter(state="1", drwaid=int(to_node),
                                                                   intertype__in=["node", "task", "complex"])
                        if c_step:
                            c_step = c_step[0]
                            result = run_all_steps(c_step, processrun)
                            if result or result == 0:
                                return result


@shared_task
def exec_process(processrunid):
    """
    执行当前流程下的所有脚本

    返回值0,：错误，1：完成，2：确认，3：流程已结束
    """
    end_step_tag = 0
    processrun = ProcessRun.objects.filter(id=processrunid)
    processrun = processrun[0]

    if len(processrun.steprun_set.all()) > 0:
        if processrun.state == "RUN" or processrun.state == "ERROR":
            # 将错误流程改成RUN
            processrun.state = "RUN"
            processrun.save()

            # 找第一个步骤
            process = processrun.process
            # 1.当前流程的start节点
            start_step = process.step_set.filter(state="1", intertype__contains="start")[0]
            line_step = \
                process.step_set.filter(state="1", type="lines",
                                        fromnode="demo_node_" + str(start_step.drwaid).zfill(10))[0]
            to_node = int(line_step.tonode.split("demo_node_")[1])
            current_step = \
                process.step_set.filter(state="1", drwaid=to_node, intertype__in=["node", "task", "complex"])[0]
            end_step_tag = run_all_steps(current_step, processrun)

            if not end_step_tag and end_step_tag != 0:
                end_step_tag = 1
        else:
            end_step_tag = 3
    else:
        myprocesstask = ProcessTask()
        myprocesstask.processrun = processrun
        myprocesstask.starttime = datetime.datetime.now()
        myprocesstask.senduser = processrun.creatuser
        myprocesstask.receiveuser = processrun.creatuser
        myprocesstask.type = "ERROR"
        myprocesstask.state = "0"
        myprocesstask.content = "流程配置错误，请处理。"
        myprocesstask.save()
    # 判断流程状态
    if end_step_tag == 0:
        processrun.state = "ERROR"
        processrun.save()
    if end_step_tag == 1:
        processrun.state = "DONE"
        processrun.endtime = datetime.datetime.now()
        processrun.save()
        myprocesstask = ProcessTask()
        myprocesstask.processrun = processrun
        myprocesstask.starttime = datetime.datetime.now()
        myprocesstask.senduser = processrun.creatuser
        myprocesstask.type = "INFO"
        myprocesstask.logtype = "END"
        myprocesstask.state = "1"
        myprocesstask.content = "流程结束。"
        myprocesstask.save()
