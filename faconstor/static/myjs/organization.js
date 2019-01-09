$(function () {

    $('#tree_2').jstree({

        'core': {
            "themes": {
                "responsive": false
            },
            "check_callback": true,
            'data': treedata
        },

        "types": {
            "org": {
                "icon": "fa fa-folder icon-state-warning icon-lg"
            },
            "user": {
                "icon": "fa fa-user icon-state-warning icon-lg"
            }
        },
        "contextmenu": {
            "items": {
                "create": null,
                "rename": null,
                "remove": null,
                "ccp": null,
                "新建组织": {
                    "label": "新建组织",
                    "action": function (data) {
                        var inst = jQuery.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        if (obj.type == "user") {
                            alert("无法在用户下新建组织。");
                        }
                        else {
                            $("#title").text("新建")
                            $("#id").val("0")
                            $("#pid").val(obj.id)
                            $("#mytype").val(obj.type)
                            $("#orgname").val("")
                            $("#orgpname").val(obj.text)
                            $("#remark").val("")
                            $("#user").hide()
                            $("#org").show()
                            $("#orgsave").show()
                        }
                    }
                },
                "新建用户": {
                    "label": "新建用户",
                    "action": function (data) {
                        var inst = jQuery.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        if (obj.type == "user") {
                            alert("无法在用户下新建用户。");
                        }
                        else {
                            $("#title").text("新建")
                            $("#id").val("0")
                            $("#pid").val(obj.id)
                            $("#mytype").val(obj.type)
                            $("#pname").val(obj.text)
                            $("#password").val("")
                            $("#fullname").val("")
                            $("#username").val("")
                            $("#phone").val("")
                            $("#price").val("")
                            $("#email").val("")
                            $("#source").empty();
                            $("#username").prop("readonly", false)
                            for (var i = 0; i < obj.data.myallgroup.length; i++) {
                                $("#source").append("<option value='" + obj.data.myallgroup[i].id + "' >" + obj.data.myallgroup[i].groupname + "</option>");
                            }
                            $(".select2, .select2-multiple").select2({
                                width: null
                            });
                            $("#newpassword").show()
                            $("#editpassword").hide()
                            $("#user").show()
                            $("#org").hide()
                            $("#usersave").show()
                        }
                    }
                },
                "删除": {
                    "label": "删除",
                    "action": function (data) {
                        var inst = jQuery.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        if (obj.children.length > 0)
                            alert("组织下还有其他组织或用户，无法删除。");
                        else {
                            if (confirm("确定要删除？删除后不可恢复。")) {
                                $.ajax({
                                    type: "POST",
                                    url: "../orgdel/",
                                    data:
                                        {
                                            id: obj.id,
                                        },
                                    success: function (data) {
                                        if (data == 1) {
                                            inst.delete_node(obj);
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
            }
            else {
                if (data.parent == "#") {
                    alert("禁止新建根节点。");
                    location.reload()
                }
                else {
                    $.ajax({
                        type: "POST",
                        url: "../orgmove/",
                        data:
                            {
                                id: data.node.id,
                                parent: data.parent,
                                old_parent: data.old_parent,
                                position: data.position,
                                old_position: data.old_position,
                            },
                        success: function (data) {
                            if (data == "重名") {
                                alert("目标组织下存在重名。");
                                location.reload()
                            }
                            else {
                                if (data == "类型") {
                                    alert("不能移动至用户下。");
                                    location.reload()
                                }
                                else {
                                    if (data != "0") {
                                        if (selectid == moveid) {
                                            var res = data.split('^')
                                            $("#pid").val(res[1])
                                            $("#pname").val(res[0])
                                            $("#orgpname").val(res[0])
                                        }


                                    }
                                }
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
            $("#formdiv").show()

            $("#id").val(data.node.id)
            $("#pid").val(data.node.parent)
            $("#mytype").val(data.node.type)
            $("#pname").val(data.node.data.pname)
            $("#title").text(data.node.text)

            if (data.node.type == "user") {
                $("#newpassword").hide()
                $("#editpassword").show()
                $("#source").empty();
                for (var i = 0; i < data.node.data.selectgroup.length; i++) {
                    $("#source").append("<option selected value='" + data.node.data.selectgroup[i].id + "' >" + data.node.data.selectgroup[i].groupname + "</option>");
                }
                for (var i = 0; i < data.node.data.noselectgroup.length; i++) {
                    $("#source").append("<option value='" + data.node.data.noselectgroup[i].id + "' >" + data.node.data.noselectgroup[i].groupname + "</option>");
                }

                $(".select2, .select2-multiple").select2({
                    width: null
                });
                $("#fullname").val(data.node.data.fullname)
                $("#username").val(data.node.data.username)
                $("#phone").val(data.node.data.phone)
                $("#price").val(data.node.data.price)
                $("#email").val(data.node.data.email)
                $("#username").prop("readonly", true)

                $("#user").show()
                $("#org").hide()
            }
            if (data.node.type == "org") {
                $("#orgpname").val(data.node.data.pname)
                $("#orgname").val(data.node.text)
                $("#remark").val(data.node.data.remark)
                $("#user").hide()
                $("#org").show()
            }
            if (data.node.parent == "#") {
                $("#orgsave").hide()
                $("#usersave").hide()
            }
            else {
                $("#orgsave").show()
                $("#usersave").show()
            }

        });

    $("#error").click(function () {
        $(this).hide();
    });
    $("#savepassword").click(function () {
        if ($("#password1").val() == "")
            alert("新密码不能为空。");
        else {
            if ($("#password2").val() == "")
                alert("确认新密码不能为空。");
            else {

                if ($("#password1").val() != $("#password2").val())
                    alert("两次输入不同。");
                else {
                    $.ajax({
                        type: "POST",
                        url: "../orgpassword/",
                        data:
                            {
                                id: $("#id").val(),
                                password1: $("#password1").val(),
                                password2: $("#password2").val(),
                            },
                        success: function (data) {
                            if (data = "1") {
                                alert("密码修改成功。");
                                $('#static').modal('hide');
                            }
                            else
                                alert(data);
                        },
                        error: function (e) {
                            alert("修改密码失败，请于管理员联系。");
                        }
                    });
                }
            }
        }
    });


});