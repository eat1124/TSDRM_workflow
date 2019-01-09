var property = {
    width: (document.body.clientWidth - 300) / 3 * 2,
    height: 450,
    toolBtns: ["start round", "end round", "task", "node", "fork", "join", "complex"],
    haveHead: true,
    headBtns: ["save", "reload", "new", "undo", "redo"],//如果haveHead=true，则定义HEAD区的按钮
    haveTool: true,
    haveGroup: true,
    useOperStack: true
};
var remark = {
    cursor: "选择指针",
    direct: "结点连线",
    start: "任务开始",
    "end": "任务结束",
    "task": "人工任务",
    node: "自动任务",
    fork: "并行起点",
    "join": "并行终点",
    "complex": "子流程",
    group: "区域",
    save: "保存",
    undo: "撤销",
    redo: "重做",
    reload: "验证",
    "new": "发布",
};
var demo;
var recoverydata;

jQuery(document).ajaxSend(function (event, xhr, settings) {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function sameOrigin(url) {
        // url could be relative or scheme relative or absolute
        var host = document.location.host; // host + port
        var protocol = document.location.protocol;
        var sr_origin = '//' + host;
        var origin = protocol + sr_origin;
        // Allow absolute or scheme relative URLs to same origin
        return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
            (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
            // or any other URL that isn't scheme relative or absolute i.e relative.
            !(/^(\/\/|http:|https:).*/.test(url));
    }

    function safeMethod(method) {
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    if (!safeMethod(settings.type) && sameOrigin(settings.url)) {
        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    }
});

$(function () {
    demo = $.createGooFlow($("#demo"), property);
    demo.setNodeRemarks(remark);
    $.ajax({
        type: "GET",
        dataType: 'json',
        url: "../../getprocess/",
        data:
            {
                id: $("#pid").val(),
            },
        success: function (data) {
            demo.loadData(data.data);
        },
        error: function (e) {
            alert("页面出现错误，请于管理员联系。");
        }
    });
    // 选中
    demo.onItemFocus = function (id, type) {
        $("#id").val(id);
        $("#type").val(type);
        if (type == 'node') {
            $("#divline").hide();
            $("#divnode").show();
            $("#code").val(demo.$nodeData[id].code);
            $("#name").val(demo.$nodeData[id].name);

            $("#approval").val(demo.$nodeData[id].approval);
            $("#rto_count_in").val(demo.$nodeData[id].rto_count_in);
            $("#remark").val(demo.$nodeData[id].remark);


            if (demo.$nodeData[id].skip) {
                if (demo.$nodeData[id].skip == "1") {
                    $('input:radio[name=radio1]')[0].checked = true;
                }
                else {
                    $('input:radio[name=radio1]')[1].checked = true;
                }
            }
            else {
                $('input:radio[name=radio1]')[1].checked = true;
            }
            if (demo.$nodeData[id].group) {
                try {
                    $("#group").val(demo.$nodeData[id].group)

                }
                catch (e) {
                }
            }

            // 子流程
            if (demo.$nodeData[id].sub_process) {
                try {
                    $("#process").val(demo.$nodeData[id].sub_process)
                } catch (e) {
                    // ..
                }
                // $(".select2, .select2-multiple").select2({
                //     width: null
                // });
            }


            if (demo.$nodeData[id].time) {
                $("#time").val(demo.$nodeData[id].time)
            }
            else {
                $("#time").val("")
            }
            var myscripts = demo.$nodeData[id].stepscript;
            $("#se_1").empty();
            for (var key in myscripts) {
                $("#se_1").append("<option id='" + key.toString() + "'>" + myscripts[key].code + "</option>");
            }

            // verify
            var my_verify = demo.$nodeData[id].verify_items;
            $("#se_2").empty();
            for (var key in my_verify) {
                $("#se_2").append("<option id='" + key.toString() + "'>" + my_verify[key].verify_name + "</option>");
            }

            if (demo.$nodeData[id].type == 'start round' || demo.$nodeData[id].type == 'end round' || demo.$nodeData[id].type == 'fork' || demo.$nodeData[id].type == 'join') {
                $("#divskip").hide();
                $("#divgroup").hide();
                $("#divprocess").hide();
                $("#divtime").hide();
                $("#divsvript").hide();
                $("#divtype").hide();
                $("#divcommvault").hide();
                $("#div_approval").hide();
                $("#div_remark").hide();
                $("#div_rto_count_in").hide();
                $("#div_verify").hide();
            }
            else if (demo.$nodeData[id].type == 'task' || demo.$nodeData[id].type == 'node') {
                $("#divskip").show();
                $("#divgroup").show();
                $("#divprocess").hide();
                $("#divtime").show();
                $("#divsvript").show();
                $("#divtype").show();
                $("#divcommvault").hide();

                $("#div_approval").show();
                $("#div_remark").show();
                $("#div_rto_count_in").show();
                $("#div_verify").show();

                if (demo.$nodeData[id].type == 'task') {
                    if ($("#nodetype").val() == "commvault") {
                        $("#divsvript").hide();
                        $("#divcommvault").show();
                    }
                }

                if (demo.$nodeData[id].type == 'node') {
                    $("#divtype").hide();
                    $("#nodetype").val() == "普通任务"
                }
            }
            // 拼接子流程
            else if (demo.$nodeData[id].type == 'complex') {
                $("#divskip").hide();
                $("#divgroup").hide();
                $("#divprocess").show();
                $("#divtime").show();
                $("#divsvript").hide();
                $("#divtype").hide();
                $("#divcommvault").hide();
                $("#div_approval").hide();
                $("#div_remark").hide();
                $("#div_rto_count_in").hide();
                $("#div_verify").hide();
            }

        }
        else if (type == 'line') {
            $("#divline").show()
            $("#divnode").hide()
            $("#linename").val(demo.$lineData[id].name)
            if (demo.$lineData[id].formula)
                $("#lineformula").val(demo.$lineData[id].formula)
            else
                $("#lineformula").val("")
        }

        return true;
    };

    // 取消选中
    demo.onItemBlur = function (id, type) {
        $("#divline").hide();
        $("#divnode").hide();
        if (type == 'node') {
            demo.$nodeData[id].code = $("#code").val()
            demo.$nodeData[id].name = $("#name").val()
            demo.$nodeData[id].skip = $("input:radio[name='radio1']:checked").val();
            if (demo.$nodeData[id].type == 'complex')
                demo.$nodeData[id].sub_process = $("#process").val();
            else
                demo.$nodeData[id].group = $("#group").val();
            demo.$nodeData[id].time = $("#time").val()
            demo.$nodeData[id].nodetype = $("#nodetype").val()


            $("#" + id + " table tr:first td:nth-child(2)").text("h");

            if (demo.$nodeData[id].type == 'start round' || demo.$nodeData[id].type == 'end round') {
                $("#" + id + " div:nth-child(3)").text($("#name").val());
            }
            else {
                $("#" + id + " table tr:first td:nth-child(2)").text($("#name").val());
            }

        }
        else if (type == 'line') {
            demo.$lineData[id].name = $("#linename").val();
            demo.$lineData[id].formula = $("#lineformula").val();
            $("#" + id + " text").text($("#linename").val());
        }
        return true;
    }
    // 保存
    demo.onBtnSaveClick = function () {
        if (confirm("保存操作会将流程重置为未发布状态，确定要保存该流程吗？")) {
            var id = $("#id").val();
            var type = $("#type").val();
            if (type == 'node') {
                demo.$nodeData[id].code = $("#code").val();
                demo.$nodeData[id].name = $("#name").val();
                demo.$nodeData[id].skip = $("input:radio[name='radio1']:checked").val();

                // 将子流程计入另一个字段
                demo.$nodeData[id].sub_process = $("#process").val();
                demo.$nodeData[id].group = $("#group").val();
                demo.$nodeData[id].time = $("#time").val();

                // add
                demo.$nodeData[id].approval = $("#approval").val();
                demo.$nodeData[id].rto_count_in = $("#rto_count_in").val();
                demo.$nodeData[id].remark = $("#remark").val();

                $("#" + id + " table tr:first td:nth-child(2)").text("h");

                if (demo.$nodeData[id].type == 'start round' || demo.$nodeData[id].type == 'end round') {
                    $("#" + id + " div:nth-child(3)").text($("#name").val());
                }
                else {
                    $("#" + id + " table tr:first td:nth-child(2)").text($("#name").val());
                }

            }
            else if (type == 'line') {
                demo.$lineData[id].name = $("#linename").val();
                demo.$lineData[id].formula = $("#lineformula").val();
                $("#" + id + " text").text($("#linename").val());
            }
            $.ajax({
                type: "POST",
                url: "../../processdrawsave/",
                data: JSON.stringify(demo.exportData()),
                success: function (data) {
                    alert(data);
                },
                error: function (e) {
                    alert("页面出现错误，请于管理员联系。");
                }
            });
        }
    }
    // 验证
    demo.onFreshClick = function () {
        if (confirm("验证前请先保存修改，是否已保存？")) {
            $.ajax({
                type: "POST",
                url: "../../processdrawtest/",
                data: {
                    id: $("#pid").val(),
                },
                success: function (data) {
                    alert(data);
                },
                error: function (e) {
                    alert("页面出现错误，请于管理员联系。");
                }
            });
        }
    }
    // 发布
    demo.onBtnNewClick = function () {
        if (confirm("发布前请先保存并验证，是否执行发布操作？")) {
            $.ajax({
                type: "POST",
                url: "../../processdrawrelease/",
                data: {
                    id: $("#pid").val(),
                },
                success: function (data) {
                    alert(data);
                },
                error: function (e) {
                    alert("页面出现错误，请于管理员联系。");
                }
            });
        }
    }
    // 删除
    demo.onItemDel = function () {
        $("#type").val("")
        $("#divline").hide()
        $("#divnode").hide()
        return true;
    };

    // 脚本管理
    $('#se_1').contextmenu({
        target: '#context-menu2',
        onItem: function (context, e) {
            if ($(e.target).text() == "新增") {
                $("#scriptid").val("0");
                $("#scriptcode").val("");
                $("#script_name").val("");
                $("#scriptip").val("");
                $("#scriptusername").val("");
                $("#scriptpassword").val("");
                $("#scriptfilename").val("");
                $("#scriptscriptpath").val("");
                $("#success_text").val("");
                $("#log_address").val("");

                document.getElementById("edit").click();
            }
            if ($(e.target).text() == "修改") {
                if ($("#se_1").find('option:selected').length == 0)
                    alert("请选择要修改的脚本。");
                else {
                    if ($("#se_1").find('option:selected').length > 1)
                        alert("修改时请不要选择多条记录。");
                    else {
                        $.ajax({
                            type: "POST",
                            url: "../../get_script_data/",
                            data: {
                                id: $("#id").val().replace("demo_node_", ""),
                                script_id: $("#se_1").find('option:selected').prop("id").replace("script_", ""),
                            },
                            dataType: "json",
                            success: function (data) {
                                $("#scriptid").val("script_" + data["id"]);
                                $("#scriptcode").val(data["code"]);
                                $("#script_name").val(data["name"]);
                                $("#scriptip").val(data["ip"]);
                                $("#scripttype").val(data.type);
                                $("#scriptusername").val(data.username);
                                $("#scriptpassword").val(data.password);
                                $("#scriptfilename").val(data.filename);
                                $("#scriptscriptpath").val(data.scriptpath);
                                $("#success_text").val(data.success_text);
                                $("#log_address").val(data.log_address);
                            },
                            error: function (e) {
                                alert("数据读取失败，请于客服联系。");
                            }
                        });


                        document.getElementById("edit").click();
                    }
                }

            }
            if ($(e.target).text() == "删除") {
                if ($("#se_1").find('option:selected').length == 0)
                    alert("请选择要删除的脚本。");
                else {
                    var c_script_id = $("#se_1").find('option:selected').attr("id");
                    if (confirm("确定要删除该脚本吗？")) {
                        $.ajax({
                            type: "POST",
                            url: "../../remove_script/",
                            data: {
                                script_id: c_script_id.replace("script_", ""),
                            },
                            success: function (data) {
                                if (data["status"] == 1) {
                                    $("#se_1").find('option:selected').remove();
                                    console.log(c_script_id);
                                    console.log(demo.$nodeData[$("#id").val()].stepscript);
                                    delete demo.$nodeData[$("#id").val()].stepscript[c_script_id];
                                    alert("删除成功！");
                                } else
                                    alert("删除失败，请于管理员联系。");
                            },
                            error: function (e) {
                                alert("删除失败，请于管理员联系。");
                            }
                        });
                    }
                }
            }
        }
    });

    // 确认项管理
    $('#se_2').contextmenu({
        target: '#context-menu3',
        onItem: function (context, e) {
            if ($(e.target).text() == "新增") {
                $("#verify_id").val("0");
                $("#verify_name").val("");
                $("#verify_state").val("");

                document.getElementById("edit").click();
            }
            if ($(e.target).text() == "修改") {
                if ($("#se_2").find('option:selected').length == 0)
                    alert("请选择要修改的确认项。");
                else {
                    if ($("#se_2").find('option:selected').length > 1)
                        alert("修改时请不要选择多条记录。");
                    else {
                        $.ajax({
                            type: "POST",
                            url: "../../get_verify_items_data/",
                            data: {
                                id: $("#id").val().replace("demo_node_", ""),
                                verify_id: $("#se_2").find('option:selected').prop("id").replace("verify_", "")
                            },
                            dataType: "json",
                            success: function (data) {
                                $("#verify_id").val("verify_" + data["id"]);
                                $("#verify_name").val(data["name"]);
                            },
                            error: function (e) {
                                alert("数据读取失败，请于客服联系。");
                            }
                        });


                        document.getElementById("edit").click();
                    }
                }

            }
            if ($(e.target).text() == "删除") {
                if ($("#se_2").find('option:selected').length == 0)
                    alert("请选择要删除的确认项。");
                else {
                    var verify_id = $("#se_2").find('option:selected').attr("id");
                    if (confirm("确定要删除该确认项吗？")) {
                        $.ajax({
                            type: "POST",
                            url: "../../remove_verify_item/",
                            data: {
                                verify_id: verify_id.replace("verify_", ""),
                            },
                            success: function (data) {
                                if (data["status"] == 1) {
                                    $("#se_2").find('option:selected').remove();
                                    delete demo.$nodeData[$("#id").val()].verify_items[verify_id];
                                    alert("删除成功！");
                                } else
                                    alert("删除失败，请于管理员联系。");
                            },
                            error: function (e) {
                                alert("删除失败，请于管理员联系。");
                            }
                        });
                    }
                }
            }
        }
    });

    // 选择脚本
    $('#sample_1').dataTable({
        "bAutoWidth": true,
        "bSort": false,
        "bProcessing": true,
        "ajax": "../../scriptdata/",
        "columns": [
            {"data": "id"},
            {"data": "code"},
            {"data": "ip"},
            {"data": "port"},
            {"data": "type"},
            {"data": "runtype"},
            {"data": "filename"},
            {"data": "time"},
            {"data": "username"},
            {"data": "password"},
            {"data": "paramtype"},
            {"data": "param"},
            {"data": "scriptpath"},
            {"data": "runpath"},
            {"data": "maxtime"},
            {"data": null}
        ],

        "columnDefs": [{
            "targets": -1,
            "data": null,
            "defaultContent": "<button  id='select' title='选择'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-check'></i></button>"
        }, {
            "targets": [-2],
            "visible": false
        }, {
            "targets": [-3],
            "visible": false
        }, {
            "targets": [-4],
            "visible": false
        }, {
            "targets": [-5],
            "visible": false
        }, {
            "targets": [-6],
            "visible": false
        }, {
            "targets": [-7],
            "visible": false
        }, {
            "targets": [-8],
            "visible": false
        }, {
            "targets": [-9],
            "visible": false
        }, {
            "targets": [0],
            "visible": false
        }],
        "oLanguage": {
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "抱歉， 没有找到",
            "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
            "sInfoEmpty": "没有数据",
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
    $('#sample_1 tbody').on('click', 'button#select', function () {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        $("#scriptcode").val(data.code);
        $("#script_name").val(data.name);
        $("#scriptip").val(data.ip);
        $("#scripttype").val(data.type);
        $("#scriptusername").val(data.username);
        $("#scriptpassword").val(data.password);
        $("#scriptfilename").val(data.filename);
        $("#scriptscriptpath").val(data.scriptpath);
        $("#success_text").val(data.success_text);
        $("#log_address").val(data.log_address);
        $('#static1').modal('hide');
    });

    // 保存脚本
    $('#scriptsave').click(function () {
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../../processscriptsave/",
            data: {
                processid: $("#pid").val(),
                pid: $("#id").val().replace("demo_node_", ""),
                id: $("#scriptid").val().replace("script_", ""),
                code: $("#scriptcode").val(),
                name: $("#script_name").val(),
                ip: $("#scriptip").val(),
                type: $("#scripttype").val(),
                username: $("#scriptusername").val(),
                password: $("#scriptpassword").val(),
                filename: $("#scriptfilename").val(),
                scriptpath: $("#scriptscriptpath").val(),
                success_text: $("#success_text").val(),
                log_address: $("#log_address").val(),
            },
            success: function (data) {
                var myres = data["res"];
                var mydata = data["data"];
                if (myres == "新增成功。") {
                    $("#scriptid").val(data["data"]);
                    $("#se_1").append("<option id='" + "script_" + mydata + "'>" + $("#scriptcode").val() + "</option>");
                    var newscript = {
                        code: $("#scriptcode").val(),
                        name: $("#script_name").val(),
                        ip: $("#scriptip").val(),
                        type: $("#scripttype").val(),
                        username: $("#scriptusername").val(),
                        password: $("#scriptpassword").val(),
                        filename: $("#scriptfilename").val(),
                        scriptpath: $("#scriptscriptpath").val(),
                        success_text: $("#success_text").val(),
                        log_address: $("#log_address").val(),
                    };
                    demo.$nodeData[$("#id").val()].stepscript["script_" + $("#scriptid").val()] = newscript
                }
                if (myres == "修改成功。") {
                    $("#" + $("#scriptid").val()).text($("#scriptcode").val());
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].code = $("#scriptcode").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].name = $("#script_name").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].ip = $("#scriptip").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].port = $("#scriptport").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].type = $("#scripttype").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].username = $("#scriptusername").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].password = $("#scriptpassword").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].filename = $("#scriptfilename").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].scriptpath = $("#scriptscriptpath").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].success_text = $("#success_text").val();
                    demo.$nodeData[$("#id").val()].stepscript[$("#scriptid").val()].log_address = $("#log_address").val();
                }
                alert(myres);
                $('#static01').modal('hide');
            },
            error: function (e) {
                alert("请保存当前步骤后，再添加关联脚本。");
            }
        });
    })

    // 确认项
    $('#verify_items_save').click(function () {
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../../verify_items_save/",
            data: {
                processid: $("#pid").val(),
                pid: $("#id").val().replace("demo_node_", ""),
                id: $("#verify_id").val().replace("verify_", ""),
                name: $("#verify_name").val(),
            },
            success: function (data) {
                var myres = data["res"];
                var mydata = data["data"];
                if (myres == "新增成功。") {
                    $("#verify_id").val(data["data"]);
                    $("#se_2").append("<option id='" + "verify_" + mydata + "'>" + $("#verify_name").val() + "</option>");
                    var new_verify = {
                        verify_name: $("#verify_name").val(),
                    };
                    demo.$nodeData[$("#id").val()].verify_items["verify_" + $("#verify_id").val()] = new_verify;
                }
                if (myres == "修改成功。") {
                    $("#" + $("#verify_id").val()).text($("#verify_name").val());
                    demo.$nodeData[$("#id").val()].verify_items[$("#verify_id").val()].verify_name = $("#verify_name").val();
                }
                alert(myres);
                $('#static02').modal('hide');
            },
            error: function (e) {
                alert("请保存当前步骤后，再添加关联确认项。");
            }
        });
    });
});


