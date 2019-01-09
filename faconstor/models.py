# -*- coding: utf-8 -*-

from __future__ import unicode_literals
from django.db import models
from django.contrib.auth.models import User


class Fun(models.Model):
    pnode = models.ForeignKey('self', blank=True, null=True, related_name='children', verbose_name='父节点')
    name = models.CharField("功能名称", max_length=100)
    sort = models.IntegerField("排序", blank=True, null=True)
    type = models.CharField("类型", blank=True, null=True, max_length=20)
    url = models.CharField("地址", blank=True, null=True, max_length=500)
    icon = models.CharField("图标", blank=True, null=True, max_length=100)


class Group(models.Model):
    name = models.CharField("组名", blank=True, null=True, max_length=50)
    fun = models.ManyToManyField(Fun)
    remark = models.CharField("说明", blank=True, null=True, max_length=5000)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    sort = models.IntegerField("排序", blank=True, null=True)


class UserInfo(models.Model):
    user = models.OneToOneField(User, blank=True, null=True, )
    userGUID = models.CharField("GUID", null=True, max_length=50)
    fullname = models.CharField("姓名", blank=True, max_length=50)
    phone = models.CharField("电话", blank=True, null=True, max_length=50)
    group = models.ManyToManyField(Group)
    pnode = models.ForeignKey('self', blank=True, null=True, related_name='children', verbose_name='父节点')
    type = models.CharField("类型", blank=True, null=True, max_length=20)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    sort = models.IntegerField("排序", blank=True, null=True)
    remark = models.CharField("说明", blank=True, null=True, max_length=5000)
    company = models.CharField("公司", blank=True, null=True, max_length=100)
    tell = models.CharField("电话", blank=True, null=True, max_length=50)
    forgetpassword = models.CharField("修改密码地址", blank=True, null=True, max_length=50)


class Process(models.Model):
    code = models.CharField("预案编号", blank=True, max_length=50)
    name = models.CharField("预案名称", blank=True, max_length=50)
    remark = models.CharField("预案描述", blank=True, null=True, max_length=5000)
    sign = models.CharField("是否签到", blank=True, null=True, max_length=20)
    rto = models.IntegerField("RTO", blank=True, null=True)
    rpo = models.IntegerField("RPO", blank=True, null=True)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    sort = models.IntegerField("排序", blank=True, null=True)
    url = models.CharField("页面链接", blank=True, max_length=100)
    type = models.CharField("预案类型", blank=True, max_length=100, null=True)
    color = models.CharField("颜色", blank=True, max_length=50)


class Step(models.Model):
    process = models.ForeignKey(Process)
    last = models.ForeignKey('self', blank=True, null=True, related_name='next', verbose_name='上一步')
    pnode = models.ForeignKey('self', blank=True, null=True, related_name='children', verbose_name='父节点')
    code = models.CharField("步骤编号", blank=True, null=True, max_length=50)
    name = models.CharField("步骤名称", blank=True, null=True, max_length=50)
    approval = models.CharField("是否审批", blank=True, null=True, max_length=10)
    skip = models.CharField("能否跳过", blank=True, null=True, max_length=10)
    group = models.CharField("角色", blank=True, null=True, max_length=50)
    time = models.IntegerField("预计耗时", blank=True, null=True)
    state = models.CharField("状态", blank=True, null=True, max_length=10)
    sort = models.IntegerField("排序", blank=True, null=True)
    rto_count_in = models.CharField("是否算入RTO", blank=True, null=True, max_length=10, default="1")
    remark = models.CharField("备注", blank=True, null=True, max_length=500, help_text="告知业务人员灾备环境地址等信息")
    # ****************************************************** add
    drwaid = models.IntegerField("画面ID", default=None)
    left = models.IntegerField("左边距", blank=True, null=True)
    top = models.IntegerField("上边距", blank=True, null=True)
    intertype = models.CharField("子类型", blank=True, null=True, max_length=50)
    width = models.IntegerField("宽度", blank=True, null=True)
    height = models.IntegerField("高度", blank=True, null=True)
    fromnode = models.CharField("起点", blank=True, null=True, max_length=50)
    tonode = models.CharField("终点", blank=True, null=True, max_length=50)
    type = models.CharField("步骤类型", blank=True, null=True, max_length=50)
    sub_process = models.CharField("子流程", blank=True, null=True, max_length=50)
    formula = models.CharField("表达式", blank=True, null=True, max_length=1000)


class Script(models.Model):
    step = models.ForeignKey(Step, blank=True, null=True)
    code = models.CharField("脚本编号", blank=True, max_length=50)
    name = models.CharField("脚本名称", blank=True, max_length=500)
    ip = models.CharField("主机IP", blank=True, null=True, max_length=50)
    port = models.CharField("端口号", blank=True, null=True, max_length=10)
    type = models.CharField("连接类型", blank=True, null=True, max_length=20)
    runtype = models.CharField("运行类型", blank=True, null=True, max_length=20)
    username = models.CharField("用户名", blank=True, null=True, max_length=50)
    password = models.CharField("密码", blank=True, null=True, max_length=50)
    filename = models.CharField("脚本文件名", blank=True, null=True, max_length=50)
    paramtype = models.CharField("参数类型", blank=True, null=True, max_length=20)
    param = models.CharField("脚本参数", blank=True, null=True, max_length=100)
    scriptpath = models.CharField("脚本文件路径", blank=True, null=True, max_length=100)
    runpath = models.CharField("执行路径", blank=True, null=True, max_length=100)
    command = models.CharField("生产命令行", blank=True, null=True, max_length=500)
    maxtime = models.IntegerField("超时时间", blank=True, null=True)
    time = models.IntegerField("预计耗时", blank=True, null=True)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    sort = models.IntegerField("排序", blank=True, null=True)
    succeedtext = models.CharField("成功代码", blank=True, null=True, max_length=500)
    log_address = models.CharField("日志地址", blank=True, null=True, max_length=100)


class ProcessRun(models.Model):
    process = models.ForeignKey(Process)
    starttime = models.DateTimeField("开始时间", blank=True, null=True)
    endtime = models.DateTimeField("结束时间", blank=True, null=True)
    creatuser = models.CharField("发起人", blank=True, max_length=50)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    run_reason = models.CharField("启动原因", blank=True, null=True, max_length=2500)
    note = models.CharField("记录", blank=True, null=True, max_length=5000)


class StepRun(models.Model):
    step = models.ForeignKey(Step, blank=True, null=True)
    processrun = models.ForeignKey(ProcessRun, blank=True, null=True)
    starttime = models.DateTimeField("开始时间", blank=True, null=True)
    endtime = models.DateTimeField("结束时间", blank=True, null=True)
    operator = models.CharField("操作人", blank=True, null=True, max_length=50)
    parameter = models.CharField("运行参数", blank=True, null=True, max_length=5000)
    result = models.CharField("运行结果", blank=True, null=True, max_length=5000)
    explain = models.CharField("运行说明", blank=True, null=True, max_length=5000)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    note = models.CharField("记录", blank=True, null=True, max_length=5000)


class ScriptRun(models.Model):
    script = models.ForeignKey(Script, blank=True, null=True)
    steprun = models.ForeignKey(StepRun, blank=True, null=True)
    starttime = models.DateTimeField("开始时间", blank=True, null=True)
    endtime = models.DateTimeField("结束时间", blank=True, null=True)
    operator = models.CharField("操作人", blank=True, null=True, max_length=50)
    result = models.CharField("运行结果", blank=True, null=True, max_length=5000)
    explain = models.CharField("运行说明", blank=True, null=True, max_length=5000)
    runlog = models.CharField("运行日志", blank=True, null=True, max_length=5000)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    note = models.CharField("记录", blank=True, null=True, max_length=5000)


class ProcessTask(models.Model):
    processrun = models.ForeignKey(ProcessRun, blank=True, null=True)
    steprun = models.ForeignKey(StepRun, blank=True, null=True)
    starttime = models.DateTimeField("发送时间", blank=True, null=True)
    senduser = models.CharField("发送人", blank=True, null=True, max_length=50)
    receiveuser = models.CharField("接收人", blank=True, null=True, max_length=50)
    receiveauth = models.CharField("接收角色", blank=True, null=True, max_length=50)
    operator = models.CharField("操作人", blank=True, null=True, max_length=50)
    endtime = models.DateTimeField("处理时间", blank=True, null=True)
    type = models.CharField("任务类型", blank=True, null=True, max_length=20)
    content = models.CharField("任务内容", blank=True, null=True, max_length=5000)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
    result = models.CharField("处理结果", blank=True, null=True, max_length=5000)
    explain = models.CharField("处理说明", blank=True, null=True, max_length=5000)
    logtype = models.CharField("日志类型", blank=True, null=True, max_length=20)


class VerifyItems(models.Model):
    step = models.ForeignKey(Step, blank=True, null=True)
    name = models.CharField("确认项", blank=True, null=True, max_length=50)
    state = models.CharField("状态", blank=True, null=True, max_length=30)


class VerifyItemsRun(models.Model):
    verify_items = models.ForeignKey(VerifyItems)
    steprun = models.ForeignKey(StepRun, blank=True, null=True)
    state = models.CharField("状态", blank=True, null=True, max_length=30)
    has_verified = models.CharField("是否确认", blank=True, null=True, max_length=20)


class Invitation(models.Model):
    process_run = models.OneToOneField(ProcessRun, blank=True, null=True)
    start_time = models.DateTimeField("开始时间", blank=True, null=True)
    end_time = models.DateTimeField("结束时间", blank=True, null=True)
    purpose = models.CharField("演练目的", max_length=5000, blank=True, null=True)
    current_time = models.DateTimeField("邀请时间", blank=True, null=True)


class KnowledgeFileDownload(models.Model):
    """
    知识库
    """
    person = models.CharField("上传人", blank=True, null=True, max_length=64)
    upload_time = models.DateTimeField("上传时间", blank=True, null=True)
    remark = models.CharField("备注", blank=True, null=True, max_length=500)
    file_name = models.CharField("文件名称", blank=True, null=True, max_length=128)
    state = models.CharField("状态", blank=True, null=True, max_length=20)
