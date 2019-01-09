var treedata = "";

// 定义构造树的函数
function customTree() {
    $.ajax({
        type: "POST",
        url: "../custom_step_tree/",
        data: {
            process: $("#process").val(),
            name: $("#name").val(),
            id: $("#id").val(),
        },
        dataType: "json",
        success: function (data) {
            JSON.stringify(data.treedata);
            treedata = data.treedata;
            $('#tree_2').jstree({
                'core': {
                    "themes": {
                        "responsive": false
                    },
                    "check_callback": true,
                    'data': treedata
                },

                "types": {
                    "node": {
                        "icon": "fa fa-folder icon-state-warning icon-lg"
                    },
                    "fun": {
                        "icon": "fa fa-file icon-state-warning icon-lg"
                    }
                },
                "contextmenu": {
                    "items": {
                        "create": null,
                        "rename": null,
                        "remove": null,
                        "ccp": null,
                        "新建": {
                            "label": "新建",
                            "action": function (data) {
                                $("#formdiv").show();
                                var inst = jQuery.jstree.reference(data.reference),
                                    obj = inst.get_node(data.reference);
                                $("#se_1").empty();
                                $("#se_2").empty();

                                $("#group").empty();
                                $("#title").text("新建");
                                $("#id").val("0");
                                $("#pid").val(obj.id);
                                $("#time").val("");
                                $("#skip option:selected").removeProp("selected");
                                $("#approval option:selected").removeProp("selected");
                                $("#group option:selected").removeProp("selected");
                                $("#rto_count_in option:selected").removeProp("selected");
                                $("#name").val("");

                                var groupInfoList = obj.data.allgroups.split("&");
                                for (var i = 0; i < groupInfoList.length - 1; i++) {
                                    var singlegroupInfoList = groupInfoList[i].split("+");
                                    $("#group").append('<option value="' + singlegroupInfoList[0] + '">' + singlegroupInfoList[1] + '</option>')
                                }
                                // inst.add_node(obj);
                            }
                        },
                        "删除": {
                            "label": "删除",
                            "action": function (data) {
                                var inst = jQuery.jstree.reference(data.reference),
                                    obj = inst.get_node(data.reference);
                                if (obj.children.length > 0)
                                    alert("节点下还有其他节点或功能，无法删除。");
                                else if (obj.data.verify == "first_node") {
                                    alert("该项为流程名称，无法删除。");
                                } else {
                                    if (confirm("确定要删除此节点？删除后不可恢复。")) {
                                        $.ajax({
                                            type: "POST",
                                            url: "../del_step/",
                                            data: {
                                                id: obj.id,
                                                process_id: $("#process option:selected").val(),
                                            },
                                            success: function (data) {
                                                if (data == 1) {
                                                    inst.delete_node(obj);
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
                        },
                    }
                },
                "plugins": ["contextmenu", "dnd", "types", "role"]
            })
                .on('move_node.jstree', function (e, data) {
                    var moveid = data.node.id;
                    if (data.old_parent == "#") {
                        alert("根节点禁止移动。");
                        location.reload()
                    } else {
                        if (data.parent == "#") {
                            alert("禁止新建根节点。");
                            location.reload()
                        } else {
                            $.ajax({
                                type: "POST",
                                url: "../move_step/",
                                data: {
                                    id: data.node.id,
                                    parent: data.parent,
                                    old_parent: data.old_parent,
                                    position: data.position,
                                    old_position: data.old_position,
                                    process_id: $("#process option:selected").val(),
                                },
                                success: function (data) {
                                    var selectid = $("#id").val();
                                    if (selectid == moveid) {
                                        var res = data.split('^');
                                        $("#pid").val(res[1]);
                                        $("#pname").val(res[0]);
                                    }
                                },
                                error: function (e) {
                                    alert("移动失败，请于管理员联系。");
                                    location.reload()
                                }
                            });


                        }
                    }
                })
                .bind('select_node.jstree', function (event, data) {
                    if (data.node.data.verify == "first_node") {
                        $("#formdiv").hide();
                    } else {
                        $("#formdiv").show();
                    }
                    $("#se_1").empty();
                    $("#se_2").empty();
                    $("#group").empty();
                    $("#title").text(data.node.text);
                    $("#id").val(data.node.id);
                    $("#pid").val(data.node.parent);
                    $("#name").val(data.node.text);
                    $("#time").val(data.node.data.time);
                    $("#approval option:selected").removeProp("selected");
                    $("#skip option:selected").removeProp("selected");
                    $("#rto_count_in option:selected").removeProp("selected");
                    $("#remark").val(data.node.data.remark);

                    var groupInfoList = data.node.data.allgroups.split("&");
                    for (var i = 0; i < groupInfoList.length - 1; i++) {
                        var singlegroupInfoList = groupInfoList[i].split("+");
                        if (singlegroupInfoList[0] == data.node.data.group) {
                            $("#group").append('<option value="' + singlegroupInfoList[0] + '" selected>' + singlegroupInfoList[1] + '</option>')
                        } else {
                            $("#group").append('<option value="' + singlegroupInfoList[0] + '">' + singlegroupInfoList[1] + '</option>')
                        }
                    }
                    $("#approval").find("option[value='" + data.node.data.approval + "']").prop("selected", true);
                    $("#skip").find("option[value='" + data.node.data.skip + "']").prop("selected", true);
                    $("#rto_count_in").find("option[value='" + data.node.data.rto_count_in + "']").prop("selected", true);

                    if (data.node.data.verify != "first_node") {
                        var scriptInfoList = data.node.data.scripts.split("&");
                        for (var i = 0; i < scriptInfoList.length - 1; i++) {
                            var singleScriptInfoList = scriptInfoList[i].split("+");
                            $("#se_1").append('<option value="' + singleScriptInfoList[0] + '">' + singleScriptInfoList[1] + '</option>')
                        }
                    }
                    if (data.node.data.verify != "first_node") {
                        var verifyItemsList = data.node.data.verifyitems.split("&");
                        for (var i = 0; i < verifyItemsList.length - 1; i++) {
                            var singleVerifyItemsList = verifyItemsList[i].split("+");
                            $("#se_2").append('<option value="' + singleVerifyItemsList[0] + '">' + singleVerifyItemsList[1] + '</option>')
                        }
                    }


                    var eventNodeName = event.target.nodeName;
                    if (eventNodeName == 'INS') {
                        return;
                    } else if (eventNodeName == 'A') {
                        var $subject = $(event.target).parent();
                        if ($subject.find('ul').length > 0) {
                            $("#title").text($(event.target).text())

                        } else {
                            //选择的id值
                            alert($(event.target).parents('li').attr('id'));
                        }
                    }


                })
            // context-menu
            $('#se_1').contextmenu({
                target: '#context-menu2',
                onItem: function (context, e) {
                    if ($(e.target).text() == "新增") {
                        $("#scriptid").val("0");
                        $("#scriptcode").val("");
                        $("#script_name").val("");
                        $("#scriptip").val("");
                        // $("#scriptport").val("");
                        $("#scriptusername").val("");
                        $("#scriptpassword").val("");
                        $("#scriptfilename").val("");
                        // $("#scriptparamtype").val("无");
                        // $("#scriptparam").val("");
                        $("#scriptscriptpath").val("");
                        // $("#scriptrunpath").val("");
                        // $("#scriptcommand").val("");
                        // $("#scriptmaxtime").val("");
                        // $("#scripttime").val("");
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
                                    url: "../get_script_data/",
                                    data: {
                                        id: $("#id").val(),
                                        script_id: $("#se_1").find('option:selected').val(),
                                    },
                                    dataType: "json",
                                    success: function (data) {
                                        $("#scriptid").val(data["id"]);
                                        $("#scriptcode").val(data["code"]);
                                        $("#script_name").val(data["name"]);
                                        $("#scriptip").val(data["ip"]);
                                        // $("#scriptport").val(data["port"]);
                                        $("#scripttype").val(data.type);
                                        // $("#scriptruntype").val(data.runtype);
                                        $("#scriptusername").val(data.username);
                                        $("#scriptpassword").val(data.password);
                                        $("#scriptfilename").val(data.filename);
                                        // $("#scriptparamtype").val(data.paramtype);
                                        // $("#scriptparam").val(data.param);
                                        $("#scriptscriptpath").val(data.scriptpath);
                                        $("#success_text").val(data.success_text);
                                        $("#log_address").val(data.log_address);
                                        // $("#scriptrunpath").val(data.runpath);
                                        // $("#scriptcommand").val("cd " + $("#scriptscriptpath").val() + ";" + $("#scriptrunpath").val() + "/" + $("#scriptfilename").val() + " " + $("#scriptparam").val());
                                        // $("#scriptmaxtime").val(data.maxtime);
                                        // $("#scripttime").val(data.time);
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
                            if (confirm("确定要删除该脚本吗？")) {
                                $.ajax({
                                    type: "POST",
                                    url: "../../remove_script/",
                                    data: {
                                        script_id: $("#se_1").find('option:selected').val(),
                                    },
                                    success: function (data) {
                                        if (data["status"] == 1) {
                                            $("#se_1").find('option:selected').remove();
                                            alert("删除成功！");
                                            $('#tree_2').jstree("destroy");

                                            customTree();
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

            // context-menu for verify
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
                                    url: "../get_verify_items_data/",
                                    data: {
                                        id: $("#id").val(),
                                        verify_id: $("#se_2").find('option:selected').val(),
                                    },
                                    dataType: "json",
                                    success: function (data) {
                                        $("#verify_id").val(data["id"]);
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
                            if (confirm("确定要删除该确认项吗？")) {
                                $.ajax({
                                    type: "POST",
                                    url: "../../remove_verify_item/",
                                    data: {
                                        verify_id: $("#se_2").find('option:selected').val(),
                                    },
                                    success: function (data) {
                                        if (data["status"] == 1) {
                                            $("#se_2").find('option:selected').remove();
                                            alert("删除成功！");
                                            $('#tree_2').jstree("destroy");

                                            customTree();
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


            // dataTable
            $("#sample_1").dataTable().fnDestroy();
            $('#sample_1').dataTable({
                "bAutoWidth": true,
                "bSort": false,
                "bProcessing": true,
                "ajax": "../../scriptdata/",
                "columns": [
                    {"data": "id"},
                    {"data": "code"},
                    {"data": "name"},
                    {"data": "ip"},
                    // {"data": "port"},
                    {"data": "type"},
                    // {"data": "runtype"},
                    {"data": "filename"},
                    // {"data": "time"},
                    {"data": "username"},
                    {"data": "password"},
                    // {"data": "paramtype"},
                    // {"data": "param"},
                    {"data": "scriptpath"},
                    // {"data": "runpath"},
                    // {"data": "maxtime"},
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
        },
        error: function (e) {
            alert("流程读取失败，请于客服联系。");
        }
    });
}


customTree();


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

$("#process").change(function () {
    $("#formdiv").hide();
    $('#tree_2').jstree("destroy");
    customTree();
});


// 脚本
$('#scriptsave').click(function () {
    $.ajax({
        type: "POST",
        dataType: 'json',
        url: "../../processscriptsave/",
        data: {
            processid: $("#process option:selected").val(),
            pid: $("#id").val().replace("demo_node_", ""),
            id: $("#scriptid").val(),
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
            alert(myres);
            if (myres == "新增成功。") {
                $("#scriptid").val(data["data"]);
                $("#se_1").append("<option value='" + mydata + "'>" + $("#script_name").val() + "</option>");
                $('#static01').modal('hide');
                // 重新构造树，停留当前修改脚本的步骤位置
                $('#tree_2').jstree("destroy");
                customTree();
            }
            if (myres == "修改成功。") {
                var script_id = $("#scriptid").val();
                $("#se_1").find('option[value="script_id"]'.replace("script_id", script_id)).text($("#script_name").val());
                $('#static01').modal('hide');
                $('#tree_2').jstree("destroy");
                customTree();
            }
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
            processid: $("#process option:selected").val(),
            id: $("#verify_id").val(),
            name: $("#verify_name").val(),
            step_id: $("#id").val(),
        },
        success: function (data) {
            var myres = data["res"];
            var mydata = data["data"];
            if (myres == "新增成功。") {
                $("#verify_id").val(data["data"]);
                $("#se_2").append("<option value='" + mydata + "'>" + $("#verify_name").val() + "</option>");
                $('#static02').modal('hide');
                $('#tree_2').jstree("destroy");
                customTree();
            }
            if (myres == "修改成功。") {
                var verify_id = $("#verify_id").val();
                $("#se_2").find('option[value="verify_id"]'.replace("verify_id", verify_id)).text($("#verify_name").val());
                $('#static02').modal('hide');
                $('#tree_2').jstree("destroy");
                customTree();
            }
            alert(myres);
        },
        error: function (e) {
            alert("请保存当前步骤后，再添加关联确认项。");
        }
    });
});


$('#save').click(function () {
    $.ajax({
        type: "POST",
        url: "../setpsave/",
        data: {
            id: $("#id").val(),
            pid: $("#pid").val(),
            name: $("#name").val(),
            time: $("#time").val(),
            skip: $("#skip").val(),
            approval: $("#approval").val(),
            group: $("#group").val(),
            rto_count_in: $("#rto_count_in").val(),
            new: $("#new").val(),
            process_id: $("#process option:selected").val(),
            remark: $("#remark").val()
        },
        success: function (data) {
            // $("#name_" + $("#id").val()).text($("#name").val());
            // $("#time_" + $("#id").val()).val($("#time").val());
            // $("#approval_" + $("#id").val()).val($("#approval").val());
            // $("#skip_" + $("#id").val()).val($("#skip").val());
            // $("#group_" + $("#id").val()).val($("#group").val());
            // var approvaltext = ""
            // if ($("#approval").val() == "1")
            //     approvaltext = "需审批"
            // var skiptext = ""
            // if ($("#skip").val() == "1")
            //     skiptext = "可跳过"
            // $("#curstring_" + $("#id").val()).text(approvaltext + skiptext);
            if (data["data"]) {
                $("#id").val(data.data);
            }
            alert("保存成功！");
            $('#tree_2').jstree("destroy");

            customTree();
        },
        error: function (e) {
            alert("保存失败，请于客服联系。");
        }
    });
});