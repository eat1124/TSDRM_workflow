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
                        var inst = jQuery.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        if (obj.type == "fun") {
                            alert("无法在功能下新建节点或功能。");
                        }
                        else {
                            $('input:radio[name=radio2]')[0].checked = true;
                            $("#title").text("新建")
                            $("#id").val("0")
                            $("#pid").val(obj.id)
                            $("#name").val("")
                            $("#pname").val(obj.text)
                            $("#url").val("")
                            $("#icon").val("")
                            $("#save").show()
                        }
                    }
                },
                "删除": {
                    "label": "删除",
                    "action": function (data) {
                        var inst = jQuery.jstree.reference(data.reference),
                            obj = inst.get_node(data.reference);
                        if (obj.children.length > 0)
                            alert("节点下还有其他节点或功能，无法删除。");
                        else {
                            if (confirm("确定要删除此节点？删除后不可恢复。")) {
                                $.ajax({
                                    type: "POST",
                                    url: "../fundel/",
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
                        url: "../funmove/",
                        data:
                            {
                                id: data.node.id,
                                parent: data.parent,
                                old_parent: data.old_parent,
                                position: data.position,
                                old_position: data.old_position,
                            },
                        success: function (data) {
                            if (data == "类型") {
                                alert("不能移动至功能下。");
                                location.reload()
                            }
                            else {
                                var selectid = $("#id").val()
                                if (selectid == moveid) {
                                    var res = data.split('^')
                                    $("#pid").val(res[1])
                                    $("#pname").val(res[0])
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
            $("#title").text(data.node.text)
            $("#id").val(data.node.id)
            $("#pid").val(data.node.parent)
            $("#name").val(data.node.text)
            $("#pname").val(data.node.data.pname)
            $("#url").val(data.node.data.url)
            $("#icon").val(data.node.data.icon)
            if (data.node.type == "fun") {
                $('input:radio[name=radio2]')[0].checked = true;
            }
            if (data.node.type == "node") {
                $('input:radio[name=radio2]')[1].checked = true;
            }
            if (data.node.parent == "#") {
                $("#save").hide()
            }
            else
                $("#save").show()

            var eventNodeName = event.target.nodeName;
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

        });

    $("#error").click(function () {
        $(this).hide();
    });
    $(document).ready(function () {
        if ($("#mytype").val() == "fun")
            $('input:radio[name=radio2]')[0].checked = true;
        if ($("#mytype").val() == "node")
            $('input:radio[name=radio2]')[1].checked = true;
    });


});