import datetime

from django.db import connection
from django.http import Http404

from .models import *


def file_iterator(file_name, chunk_size=512):
    with open(file_name, "rb") as f:
        while True:
            c = f.read(chunk_size)
            if c:
                yield c
            else:
                break


def custom_time(time):
    """
    构造最新操作的时间
    :param time:
    :return:
    """
    time = time.replace(tzinfo=None)
    timenow = datetime.datetime.now()
    days = int((timenow - time).days)

    if days > 1095:
        time = "很久以前"
    else:
        if days > 730:
            time = "2年前"
        else:
            if days > 365:
                time = "1年前"
            else:
                if days > 182:
                    time = "半年前"
                else:
                    if days > 150:
                        time = "5月前"
                    else:
                        if days > 120:
                            time = "4月前"
                        else:
                            if days > 90:
                                time = "3月前"
                            else:
                                if days > 60:
                                    time = "2月前"
                                else:
                                    if days > 30:
                                        time = "1月前"
                                    else:
                                        if days >= 1:
                                            time = str(days) + "天前"
                                        else:
                                            hours = int((timenow - time).seconds / 3600)
                                            if hours >= 1:
                                                time = str(hours) + "小时"
                                            else:
                                                minutes = int((timenow - time).seconds / 60)
                                                if minutes >= 1:
                                                    time = str(minutes) + "分钟"
                                                else:
                                                    time = "刚刚"
    return time


def custom_c_color(task_type, task_state, task_logtype):
    """
    构造图标与颜色
    :param task_type:
    :param task_state:
    :param task_logtype:
    :return: current_icon, current_color
    """
    if task_type == "ERROR":
        current_icon = "fa fa-exclamation-triangle"
        if task_state == "0":
            current_color = "label-danger"
        if task_state == "1":
            current_color = "label-default"
    elif task_type == "SIGN":
        current_icon = "fa fa-user"
        if task_state == "0":
            current_color = "label-warning"
        if task_state == "1":
            current_color = "label-info"
    elif task_type == "RUN":
        current_icon = "fa fa-bell-o"
        if task_state == "0":
            current_color = "label-warning"
        if task_state == "1":
            current_color = "label-info"
    else:
        current_color = "label-success"
        if task_logtype == "START":
            current_icon = "fa fa-power-off"
        elif task_logtype == "START":
            current_icon = "fa fa-power-off"
        elif task_logtype == "STEP":
            current_icon = "fa fa-cog"
        elif task_logtype == "SCRIPT":
            current_icon = "fa fa-cog"
        elif task_logtype == "STOP":
            current_icon = "fa fa-stop"
        elif task_logtype == "CONTINUE":
            current_icon = "fa fa-play"
        elif task_logtype == "IGNORE":
            current_icon = "fa fa-share"
        elif task_logtype == "START":
            current_icon = "fa fa-power-off"
        elif task_logtype == "END":
            current_icon = "fa fa-lock"
        else:
            current_icon = "fa fa-info-circle"
    return current_icon, current_color


def get_c_process_run_tasks(current_processrun_id):
    """
    获取当前系统任务
    :return:
    """
    # 当前系统任务
    current_process_task_info = []

    cursor = connection.cursor()
    cursor.execute("""
    select t.starttime, t.content, t.type, t.state, t.logtype from faconstor_processtask as t where t.processrun_id = '{0}' order by t.starttime desc;
    """.format(current_processrun_id))
    rows = cursor.fetchall()
    if len(rows) > 0:
        for task in rows:
            time = task[0]
            content = task[1]
            task_type = task[2]
            task_state = task[3]
            task_logtype = task[4]

            # 图标与颜色
            current_icon, current_color = custom_c_color(task_type, task_state, task_logtype)

            time = custom_time(time)

            current_process_task_info.append(
                {"content": content, "time": time, "task_color": current_color,
                 "task_icon": current_icon})
    return current_process_task_info


def group_get_user_tree(parent, selectusers):
    nodes = []
    children = parent.children.order_by("sort").exclude(state="9").all()
    for child in children:
        node = {}
        node["text"] = child.fullname
        node["id"] = "user_" + str(child.id)
        node["type"] = child.type
        if child.type == "user" and child in selectusers:
            node["state"] = {"selected": True}
        node["children"] = group_get_user_tree(child, selectusers)
        nodes.append(node)
    return nodes


def group_get_fun_tree(parent, selectfuns):
    nodes = []
    children = parent.children.order_by("sort").all()
    for child in children:
        node = {}
        node["text"] = child.name
        node["id"] = "fun_" + str(child.id)
        node["type"] = child.type
        if child.type == "fun" and child in selectfuns:
            node["state"] = {"selected": True}
        node["children"] = group_get_fun_tree(child, selectfuns)
        nodes.append(node)
    return nodes


def get_step_tree(parent, selectid):
    nodes = []
    children = parent.children.exclude(state="9").order_by("sort").all()
    for child in children:
        node = {}
        node["text"] = child.name
        node["id"] = child.id
        node["children"] = get_step_tree(child, selectid)

        scripts = child.script_set.exclude(state="9")
        script_string = ""
        for script in scripts:
            id_code_plus = str(script.id) + "+" + str(script.name) + "&"
            script_string += id_code_plus

        verify_items_string = ""
        verify_items = child.verifyitems_set.exclude(state="9")
        for verify_item in verify_items:
            id_name_plus = str(verify_item.id) + "+" + str(verify_item.name) + "&"
            verify_items_string += id_name_plus

        group_name = ""
        if child.group and child.group != " ":
            group_id = child.group
            try:
                group_id = int(group_id)
            except:
                raise Http404()

            group_name = Group.objects.filter(id=group_id)[0].name
        all_groups = Group.objects.exclude(state="9")
        group_string = " " + "+" + " -------------- " + "&"
        for group in all_groups:
            id_name_plus = str(group.id) + "+" + str(group.name) + "&"
            group_string += id_name_plus

        node["data"] = {"time": child.time, "approval": child.approval, "skip": child.skip, "group_name": group_name,
                        "group": child.group, "scripts": script_string, "allgroups": group_string,
                        "rto_count_in": child.rto_count_in, "remark": child.remark,
                        "verifyitems": verify_items_string}
        try:
            if int(selectid) == child.id:
                node["state"] = {"selected": True}
        except:
            pass
        nodes.append(node)
    return nodes


def getchildrensteps(processrun, sub_process, step_intertype):
    childresult = []
    if step_intertype == "complex":
        # 获取子流程所有步骤信息
        sub_process_id = int(sub_process)
        c_process = Process.objects.filter(id=int(sub_process_id)).filter(state="1")
        if c_process.exists():
            c_process = c_process[0]
            steplist = c_process.step_set.filter(state="1").filter(
                intertype__in=["node", "task"]).order_by("sort")
            for step in steplist:
                runid = 0
                starttime = ""
                endtime = ""
                operator = ""
                parameter = ""
                runresult = ""
                explain = ""
                state = ""
                group = ""
                note = ""
                rto = 0
                steprunlist = step.steprun_set.filter(processrun=processrun)
                if len(steprunlist) > 0:
                    runid = steprunlist[0].id
                    try:
                        starttime = steprunlist[0].starttime.strftime("%Y-%m-%d %H:%M:%S")
                    except:
                        pass
                    try:
                        endtime = steprunlist[0].endtime.strftime("%Y-%m-%d %H:%M:%S")
                    except:
                        pass
                    rto = ""
                    if steprunlist[0].state == "DONE":
                        try:
                            current_delta_time = (steprunlist[0].endtime - steprunlist[0].starttime).total_seconds()
                            m, s = divmod(current_delta_time, 60)
                            h, m = divmod(m, 60)
                            rto = "%d时%02d分%02d秒" % (h, m, s)
                        except:
                            pass
                    else:
                        start_time = steprunlist[0].starttime.replace(tzinfo=None) if steprunlist[0].starttime else ""
                        current_time = datetime.datetime.now()
                        current_delta_time = (
                                current_time - start_time).total_seconds() if current_time and start_time else 0
                        m, s = divmod(current_delta_time, 60)
                        h, m = divmod(m, 60)
                        rto = "%d时%02d分%02d秒" % (h, m, s)
                    operator = steprunlist[0].operator
                    if operator is not None and operator != "":
                        try:
                            curuser = User.objects.get(username=operator)
                            operator = curuser.userinfo.fullname
                        except:
                            pass
                    else:
                        operator = ""
                    parameter = steprunlist[0].parameter
                    runresult = steprunlist[0].result
                    explain = steprunlist[0].explain
                    state = steprunlist[0].state
                    note = steprunlist[0].note
                    group = step.group
                    try:
                        curgroup = Group.objects.get(id=int(group))
                        group = curgroup.name
                    except:
                        pass
                scripts = []
                scriptlist = Script.objects.exclude(state="9").filter(step=step)
                for script in scriptlist:
                    runscriptid = 0
                    scriptstarttime = ""
                    scriptendtime = ""
                    scriptoperator = ""
                    scriptrunresult = ""
                    scriptexplain = ""
                    scriptrunlog = ""
                    scriptstate = ""
                    if len(steprunlist) > 0:
                        scriptrunlist = ScriptRun.objects.exclude(state="9").filter(steprun=steprunlist[0],
                                                                                    script=script)
                        if len(scriptrunlist) > 0:
                            runscriptid = scriptrunlist[0].id
                            try:
                                scriptstarttime = scriptrunlist[0].starttime.strftime("%Y-%m-%d %H:%M:%S")
                            except:
                                pass
                            try:
                                scriptendtime = scriptrunlist[0].endtime.strftime("%Y-%m-%d %H:%M:%S")
                            except:
                                pass
                            scriptoperator = scriptrunlist[0].operator
                            scriptrunlog = scriptrunlist[0].runlog
                            scriptrunresult = scriptrunlist[0].result
                            scriptexplain = scriptrunlist[0].explain
                            scriptstate = scriptrunlist[0].state
                    scripts.append(
                        {"id": script.id, "code": script.code, "name": script.name, "runscriptid": runscriptid,
                         "scriptstarttime": scriptstarttime,
                         "scriptendtime": scriptendtime, "scriptoperator": scriptoperator,
                         "scriptrunresult": scriptrunresult, "scriptexplain": scriptexplain,
                         "scriptrunlog": scriptrunlog, "scriptstate": scriptstate})

                verifyitems = []
                verifyitemslist = VerifyItems.objects.exclude(state="9").filter(step=step)
                for verifyitem in verifyitemslist:
                    runverifyitemid = 0
                    has_verified = ""
                    verifyitemstate = ""
                    if len(steprunlist) > 0:
                        verifyitemsrunlist = VerifyItemsRun.objects.exclude(state="9").filter(steprun=steprunlist[0],
                                                                                              verify_items=verifyitem)
                        if len(verifyitemsrunlist) > 0:
                            runverifyitemid = verifyitemsrunlist[0].id
                            has_verified = verifyitemsrunlist[0].has_verified
                            verifyitemstate = verifyitemsrunlist[0].state
                    verifyitems.append(
                        {"id": verifyitem.id, "name": verifyitem.name, "runverifyitemid": runverifyitemid,
                         "has_verified": has_verified,
                         "verifyitemstate": verifyitemstate})

                childresult.append({"id": step.id, "code": step.code, "name": step.name, "approval": step.approval,
                                    "skip": step.skip, "group": group, "time": step.time, "runid": runid,
                                    "starttime": starttime, "endtime": endtime, "operator": operator,
                                    "parameter": parameter, "runresult": runresult,
                                    "explain": explain, "state": state, "scripts": scripts, "verifyitems": verifyitems,
                                    "note": note, "rto": rto,
                                    "children": getchildrensteps(processrun, step.sub_process, step.intertype)})
    return childresult


def set_error_state(temp_request, process_run_id, task_content):
    current_process_runs = ProcessRun.objects.filter(id=process_run_id)
    if current_process_runs:
        current_process_run = current_process_runs[0]
        current_process_run.state = "ERROR"
        current_process_run.save()
        current_step_runs = current_process_run.steprun_set.filter(state="RUN")
        if len(current_step_runs) > 1:
            for current_step_run in current_step_runs:
                if current_step_run.step.pnode_id is not None:
                    current_step_run.state = "ERROR"
                    current_step_run.save()
                    current_script_runs = current_step_run.scriptrun_set.filter(state="RUN")
                    if current_script_runs:
                        current_script_run = current_script_runs[0]
                        current_script_run.state = "ERROR"
                        current_script_run.explain = task_content
                        current_script_run.save()
        myprocesstask = ProcessTask()
        myprocesstask.processrun_id = process_run_id
        myprocesstask.starttime = datetime.datetime.now()
        myprocesstask.senduser = temp_request.user.username
        myprocesstask.type = "INFO"
        myprocesstask.logtype = "ERROR"
        myprocesstask.state = "1"
        myprocesstask.content = task_content
        myprocesstask.save()
    else:
        raise Http404()


def if_contains_sign(file_name):
    sign_string = '\/"*?<>'
    for i in sign_string:
        if i in file_name:
            return True
    return False


def custom_all_steps(process):
    # 判断是否包含子流程
    sub_processes = process.step_set.filter(state="1").filter(
        intertype__in=["node", "task", "complex"]).values_list("sub_process", "intertype")
    mysteps = ""
    for sub_process in sub_processes:
        if sub_process[1] == "complex":
            sub_process_id = sub_process[0]
            print("***********", sub_process_id)
            c_process = Process.objects.filter(id=int(sub_process_id)).filter(state="1")

            mystep = c_process[0].step_set.filter(state="1").filter(
                intertype__in=["node", "task"])
        else:
            mystep = process.step_set.filter(state="1").filter(
                intertype__in=["node", "task"])

        if mysteps:
            mysteps = mysteps | mystep
        else:
            mysteps = mystep
    return mysteps


def custom_wrapper_step_list(process_id):
    num_to_char_choices = {
        "1": "一.",
        "2": "二.",
        "3": "三.",
        "4": "四.",
        "5": "五.",
        "6": "六.",
        "7": "七.",
        "8": "八.",
        "9": "九.",
    }
    c_process = Process.objects.filter(state="1", id=process_id)
    assert c_process[0], "流程未发布"
    c_process = c_process[0]
    p_steps = c_process.step_set.order_by("sort").filter(state="1", intertype__in=["node", "task", "complex"])
    wrapper_step_list = []
    for num, p_step in enumerate(p_steps):
        num_str = str(num + 1)
        wrapper_step_name = ""
        wrapper_step_group_name = ""
        wrapper_verify_list = []
        wrapper_script_list = []
        inner_step_list = []

        if p_step.intertype == "complex":
            sup_process_id = p_step.sub_process
            sub_process = Process.objects.filter(state="1", id=sup_process_id)
            if sub_process.exists():
                sub_process = sub_process[0]
                wrapper_step_name = num_to_char_choices[num_str] + sub_process.name
                sub_process_steps = sub_process.step_set.filter(state="1", intertype__in=["node", "task"]).order_by(
                    "sort")
                for sub_process_step in sub_process_steps:
                    inner_step_name = sub_process_step.name

                    inner_step_group_id = sub_process_step.group
                    try:
                        inner_step_group_id = int(inner_step_group_id)
                    except:
                        inner_step_group_id = None
                    inner_step_group = Group.objects.filter(id=inner_step_group_id)
                    if inner_step_group.exists():
                        inner_step_group_name = inner_step_group[0].name
                    else:
                        inner_step_group_name = ""

                    inner_verify_list = []
                    all_inner_verifys = sub_process_step.verifyitems_set.exclude(state="9")
                    for inner_verify in all_inner_verifys:
                        inner_verify_dict = {
                            "inner_verify_name": inner_verify.name
                        }
                        inner_verify_list.append(inner_verify_dict)

                    inner_script_list = []
                    all_inner_scripts = sub_process_step.script_set.exclude(state="9")
                    for inner_script in all_inner_scripts:
                        inner_script_dict = {
                            "inner_script_name": inner_script.name
                        }
                        inner_script_list.append(inner_script_dict)

                    inner_step_list.append({
                        "inner_verify_list": inner_verify_list,
                        "inner_step_name": inner_step_name,
                        "inner_step_group_name": inner_step_group_name,
                        "inner_script_list": inner_script_list,
                    })
            else:
                pass
        else:
            wrapper_step_name = num_to_char_choices[num_str] + p_step.name

            wrapper_step_group_id = p_step.group
            try:
                wrapper_step_group_id = int(wrapper_step_group_id)
            except:
                wrapper_step_group_id = None
            wrapper_step_group = Group.objects.filter(id=wrapper_step_group_id)
            if wrapper_step_group.exists():
                wrapper_step_group_name = wrapper_step_group[0].name
            else:
                wrapper_step_group_name = ""

            all_wrapper_verifys = p_step.verifyitems_set.exclude(state="9")
            for wrapper_verify in all_wrapper_verifys:
                wrapper_verify_dict = {
                    "wrapper_verify_name": wrapper_verify.name
                }
                wrapper_verify_list.append(wrapper_verify_dict)

            all_wrapper_scripts = p_step.script_set.exclude(state="9")
            for wrapper_script in all_wrapper_scripts:
                wrapper_script_dict = {
                    "wrapper_script_name": wrapper_script.name
                }
                wrapper_script_list.append(wrapper_script_dict)

        wrapper_step_list.append({
            "wrapper_step_name": wrapper_step_name,
            "wrapper_step_group_name": wrapper_step_group_name,
            "wrapper_verify_list": wrapper_verify_list,
            "wrapper_script_list": wrapper_script_list,
            "inner_step_list": inner_step_list,
        })
    return wrapper_step_list


def sort_c_process_steps(my_process, current_step):
    """
    对当前流程步骤添加sort字段
    :param current_step:
    :return:
    """
    line_step = \
        my_process.step_set.filter(state="1", type="lines",
                                  fromnode="demo_node_" + str(current_step.drwaid).zfill(10))[0]
    to_node = line_step.tonode.split("demo_node_")[1]
    next_step = \
        my_process.step_set.filter(state="1", drwaid=to_node, intertype__in=["node", "task", "complex"])
    return next_step
