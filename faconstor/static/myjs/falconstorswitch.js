$(document).ready(function () {
    function customProcessDataTable() {
        $('#sample_1').dataTable({
            "bAutoWidth": true,
            "bSort": false,
            "bProcessing": true,
            "ajax": "../falconstorswitchdata/",
            "fnServerParams": function (aoData) {
                aoData.push({
                    name: "process_id",
                    value: $("#process_id").val()
                })
            },
            "columns": [
                {"data": "processrun_id"},
                {"data": "process_name"},
                {"data": "createuser"},
                {"data": "state"},
                {"data": "run_reason"},
                {"data": "starttime"},
                {"data": "endtime"},
                {"data": "process_id"},
                {"data": "process_url"},
                {"data": null},
            ],
            "columnDefs": [{
                "targets": 1,
                "render": function (data, type, full) {
                    return "<td><a href='process_url' target='_blank'>data</a></td>".replace("data", full.process_name).replace("process_url", "/processindex/" + full.processrun_id + "?s=true")
                }
            }, {
                "visible": false,
                "targets": -2  // 倒数第一列
            }, {
                "visible": false,
                "targets": -3  // 倒数第一列
            }, {
                "targets": -1,  // 指定最后一列添加按钮；
                "data": null,
                "width": "60px",  // 指定列宽；
                "render": function (data, type, full) {
                    return "<td><button class='btn btn-xs btn-primary' type='button'><a href='/custom_pdf_report/?processrunid&processid'><i class='fa fa-arrow-circle-down' style='color: white'></i></a></button><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button></td>".replace("processrunid", "processrunid=" + full.processrun_id).replace("processid", "processid=" + full.process_id)
                }
            }],

            "oLanguage": {
                "sLengthMenu": "&nbsp;&nbsp;每页显示 _MENU_ 条记录",
                "sZeroRecords": "抱歉， 没有找到",
                "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "sInfoEmpty": '',
                "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
                "sSearch": "搜索",
                "oPaginate": {
                    "sFirst": "首页",
                    "sPrevious": "前一页",
                    "sNext": "后一页",
                    "sLast": "尾页"
                },
                "sZeroRecords": "没有检索到数据",

            }
        });

        $('#sample_1 tbody').on('click', 'button#delrow', function () {
            if (confirm("确定要删除该条数据？")) {
                var table = $('#sample_1').DataTable();
                var data = table.row($(this).parents('tr')).data();
                $.ajax({
                    type: "POST",
                    url: "../../delete_current_process_run/",
                    data:
                        {
                            processrun_id: data.processrun_id
                        },
                    success: function (data) {
                        if (data == 1) {
                            table.ajax.reload();
                            alert("删除成功！");
                        }
                        else
                            alert("删除失败，请于管理员联系。");
                    },
                    error: function (e) {
                        alert("删除失败，请于管理员联系。");
                    }
                });

            }
        });
    }

    customProcessDataTable();

    $("#confirm").click(function () {
        var process_id = $("#process_id").val();

        // 非邀请流程启动
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../falconstorrun/",
            data:
                {
                    processid: process_id,
                    run_person: $("#run_person").val(),
                    run_time: $("#run_time").val(),
                    run_reason: $("#run_reason").val(),
                },
            success: function (data) {
                if (data["res"] == "新增成功。") {
                    window.location.href = data["data"];
                }
                else
                    alert(data["res"]);
            },
            error: function (e) {
                alert("流程启动失败，请于管理员联系。");
            }
        });
    });

    $("#confirm_invited").click(function () {
        var process_id = $("#process_id").val();
        var plan_process_run_id = $("#plan_process_run_id").val();
        // 需邀请流程启动
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../falconstor_run_invited/",
            data:
                {
                    processid: process_id,
                    plan_process_run_id: plan_process_run_id,
                    run_person: $("#runperson").val(),
                    run_time: $("#runtime").val(),
                    run_reason: $("#runreason").val(),
                },
            success: function (data) {
                if (data["res"] == "新增成功。") {
                    window.location.href = data["data"];
                }
                else
                    alert(data["res"]);
            },
            error: function (e) {
                alert("流程启动失败，请于管理员联系。");
            }
        });
    });


    $("#run").click(function () {
        $("#static").modal({backdrop: "static"});
        // 写入当前时间
        var myDate = new Date();
        $("#run_time").val(myDate.toLocaleString());
    });

    $("#run_invited").click(function () {
        $("#static02").modal({backdrop: "static"});
        // 写入当前时间
        var myDate = new Date();
        $("#runtime").val(myDate.toLocaleString());
    });

    $("#plan").click(function () {
        var plan_process_run_id = $("#plan_process_run_id").val();
        $("#static01").modal({backdrop: "static"});
        if (plan_process_run_id != "" && plan_process_run_id != null) {
            $("#save_div").hide();
            $("#download_div").show();
            // 填充开始时间与结束时间
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: "../fill_with_invitation/",
                data:
                    {
                        plan_process_run_id: plan_process_run_id,
                    },
                success: function (data) {
                    $("#start_date").val(data.start_time);
                    $("#end_date").val(data.end_time);
                    $("#purpose").val(data.purpose);
                },
                error: function (e) {
                    alert("获取邀请函数据失败，请于管理员联系。");
                }
            });
        } else {
            $("#save_div").show();
            $("#download_div").hide();
        }
    });

    $("#generate").click(function () {
        var process_id = $("#process_id").val();
        var start_date = $("#start_date").val();
        var end_date = $("#end_date").val();
        var purpose = $("#purpose").val();
        if (start_date == "" || start_date == null) {
            alert("演练开始时间！");
        } else if (end_date == "" || end_date == null) {
            alert("演练结束时间！");
        } else {
            window.open('/invite/?process_id=' + process_id + '&start_date=' + start_date + '&end_date=' + end_date + '&purpose=' + purpose);
        }
    });

    $('#start_date').datetimepicker({
        autoclose: true,
        format: 'yyyy-mm-dd hh:ii',
    });
    $('#end_date').datetimepicker({
        autoclose: true,
        format: 'yyyy-mm-dd hh:ii',
    });

    // 保存邀请函
    $("#save_invitation").click(function () {
        var process_id = $("#process_id").val();
        var plan_process_run_id = $("#plan_process_run_id").val();
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../save_invitation/",
            data:
                {
                    process_id: process_id,
                    plan_process_run_id: plan_process_run_id,
                    start_time: $("#start_date").val(),
                    end_time: $("#end_date").val(),
                    purpose: $("#purpose").val(),
                },
            success: function (data) {
                if (data["res"] == "流程计划成功，待开启流程。") {
                    $("#save_div").hide();
                    $("#download_div").show();
                    $("#plan_process_run_id").val(data["data"]);
                    $("#static01").modal("hide");
                    // $("#sample_1").DataTable().destroy();
                    // customProcessDataTable();
                    window.location.href = "/"
                }
                else
                    alert(data["res"]);
            }
        });
    });

    // 取消计划流程
    $("#reject_invited").click(function () {
        var plan_process_run_id = $("#plan_process_run_id").val();
        if (confirm("是否取消当前流程计划？")) {
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: "../reject_invited/",
                data:
                    {
                        plan_process_run_id: plan_process_run_id,
                    },
                success: function (data) {
                    alert(data["res"]);
                    if (data['res'] === "取消演练计划成功！") {
                        // 关闭模态框刷新表格
                        window.location.reload();
                    }
                }
            });
        }
    });


    // 修改计划流程
    $("#modify_invited").click(function () {
        $("#static03").modal({backdrop: "static"});
        $('#start_date_modify').datetimepicker({
            autoclose: true,
            format: 'yyyy-mm-dd hh:ii',
        });
        $('#end_date_modify').datetimepicker({
            autoclose: true,
            format: 'yyyy-mm-dd hh:ii',
        });
    });

    // 保存修改计划流程
    $("#save_modify_invitation").click(function () {
        var plan_process_run_id = $("#plan_process_run_id").val();
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../save_modify_invitation/",
            data:
                {
                    plan_process_run_id: plan_process_run_id,
                    start_date_modify: $("#start_date_modify").val(),
                    end_date_modify: $("#end_date_modify").val(),
                    purpose_modify: $("#purpose_modify").val(),
                },
            success: function (data) {
                if (data["res"] == "修改流程计划成功，待开启流程。") {
                    $("#save_div").hide();
                    $("#download_div").show();
                    $("#plan_process_run_id").val(data["data"]);
                    $("#static03").modal("hide");
                    $("#static01").modal("hide");
                }
                else
                    alert(data["res"]);
            }
        });
        $("#sample_1").DataTable().destroy();
        customProcessDataTable();
    })

});
