$(function() {
    $('#se_1').contextmenu({
        target: '#context-menu2',
        onItem: function (context, e) {
            if ($(e.target).text() == "新增") {
                $("#editgroup").show()
                $("#user").hide()
                $("#fun").hide()
                $("#id").val("0")
                $("#name").val("")
                $("#remark").val("")
                $("#title").text("新建")
            }

            if ($(e.target).text() == "删除") {
                if ($("#se_1").find('option:selected').length == 0)
                    alert("请选择要删除的角色。");
                else {
                    if (confirm("错误删除角色典可能引起流程瘫痪，确定要删除该角色吗？")) {
                        $.ajax({
                            type: "POST",
                            url: "../groupdel/",
                            data:
                                {
                                    id: $("#se_1").find('option:selected').attr("id"),
                                },
                            success: function (data) {
                                if (data == "删除成功。") {
                                    $("#se_1").find('option:selected').remove();
                                    $("#user").hide()
                                    $("#fun").hide()
                                    $("#id").val("0")
                                    $("#name").val("")
                                    $("#remark").val("")
                                    $("#title").text("")
                                }
                                alert(data);
                            },
                            error: function (e) {
                                alert("页面出现错误，请于管理员联系。");
                            }
                        });
                    }
                }
            }

        }
    });
    $('#se_1').change(function () {
        $("#editgroup").show()
        $("#user").show()
        $("#fun").show()
        $("#id").val($("#se_1").find('option:selected').attr('id'))
        $("#name").val($("#se_1").find('option:selected').text())
        $("#remark").val($("#se_1").find('option:selected').attr('remark'))
        $("#title").text($("#se_1").find('option:selected').text())


    });
    $('#save').click(function () {
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../groupsave/",
            data:
                {
                    id: $("#id").val(),
                    name: $("#name").val(),
                    remark: $("#remark").val(),
                },
            success: function (data) {
                var myres = data["res"];
                var mydata = data["data"];
                if (myres == "新增成功。") {
                    $("#id").val(data["data"])
                    $("#se_1").append("<option selected id='" + mydata + "' remark='" + $("#remark").val() + "'>" + $("#name").val() + "</option>");
                    $("#title").text($("#name").val())
                }
                if (myres == "修改成功。") {
                    $("#" + $("#id").val()).text($("#name").val())
                    $("#" + $("#id").val()).attr('remark', $("#remark").val())

                }
                alert(myres);
            },
            error: function (e) {
                alert("页面出现错误，请于管理员联系。");
            }
        });
    })

    $('#user').click(function () {

        $.ajax({

            type: "POST",
            dataType: 'json',
            url: "../getusertree/",
            data:
                {
                    id: $("#id").val(),
                },
            success: function (data) {
                $('#tree_2').data('jstree', false).empty();

                $('#tree_2').jstree({
                    'plugins': ["checkbox", "types"],
                    'core': {
                        "themes": {
                            "responsive": false
                        },
                        'data': data
                    },

                    "types": {
                        "org": {
                            "icon": "fa fa-folder icon-state-warning icon-lg"
                        },
                        "user": {
                            "icon": "fa fa-user icon-state-warning icon-lg"
                        }
                    }
                });
            },
            error: function (e) {

                alert("页面出现错误，请于管理员联系。");
            }
        });

    })

    $('#saveuser').click(function () {
        $.ajax({

            type: "POST",
            url: "../groupsaveusertree/",
            data:
                {
                    id: $("#id").val(),
                    selecteduser: $("#tree_2").jstree("get_checked", null, true).toString(),
                },
            success: function (data) {
                $('#static1').modal('hide');
                alert(data);
            },
            error: function (e) {

                alert("页面出现错误，请于管理员联系。");
            }
        });


    })

    $('#fun').click(function () {

        $.ajax({

            type: "POST",
            dataType: 'json',
            url: "../getfuntree/",
            data:
                {
                    id: $("#id").val(),
                },
            success: function (data) {
                $('#tree_3').data('jstree', false).empty();

                $('#tree_3').jstree({
                    'plugins': ["checkbox", "types"],
                    'core': {
                        "themes": {
                            "responsive": false
                        },
                        'data': data
                    },
                    "types": {
                        "node": {
                            "icon": "fa fa-folder icon-state-warning icon-lg"
                        },
                        "fun": {
                            "icon": "fa fa-file icon-state-warning icon-lg"
                        }
                    }
                });
            },
            error: function (e) {

                alert("页面出现错误，请于管理员联系。");
            }
        });

    })

    $('#savefun').click(function () {
        $.ajax({

            type: "POST",
            url: "../groupsavefuntree/",
            data:
                {
                    id: $("#id").val(),
                    selectedfun: $("#tree_3").jstree("get_checked", null, true).toString(),
                },
            success: function (data) {
                $('#static2').modal('hide');
                alert(data);
            },
            error: function (e) {

                alert("页面出现错误，请于管理员联系。");
            }
        });


    })

})




