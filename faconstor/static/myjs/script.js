$(document).ready(function () {
    $('#sample_1').dataTable({
        "bAutoWidth": true,
        "bSort": false,
        "bProcessing": true,
        "ajax": "../scriptdata/",
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
            {"data": "success_text"},
            {"data": "log_address"},
            // {"data": "runpath"},
            // {"data": "maxtime"},
            {"data": null}
        ],

        "columnDefs": [{
            "targets": -1,
            "data": null,
            "width": "100px",
            "defaultContent": "<button  id='edit' title='编辑' data-toggle='modal'  data-target='#static'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-edit'></i></button><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button>"
        },
            //     {
            //     "targets": [-2],
            //     "visible": false
            // }, {
            //     "targets": [-3],
            //     "visible": false
            // },
            {
                "targets": [-5],
                "visible": false
            },
            //     {
            //     "targets": [-6],
            //     "visible": false
            // }, {
            //     "targets": [-7],
            //     "visible": false
            // },
            {
                "targets": [-8],
                "visible": false
            },
            // {
            //     "targets": [-9],
            //     "visible": false
            // }
        ],
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
    // 行按钮
    $('#sample_1 tbody').on('click', 'button#delrow', function () {
        if (confirm("确定要删除该条数据？")) {
            var table = $('#sample_1').DataTable();
            var data = table.row($(this).parents('tr')).data();
            $.ajax({
                type: "POST",
                url: "../scriptdel/",
                data:
                    {
                        id: data.id
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
    $('#sample_1 tbody').on('click', 'button#edit', function () {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        $("#id").val(data.id);
        $("#code").val(data.code);
        $("#name").val(data.name);
        $("#ip").val(data.ip);
        // $("#port").val(data.port);
        // $("#type").val(data.type);
        // $("#runtype").val(data.runtype);
        $("#username").val(data.username);
        $("#password").val(data.password);
        $("#filename").val(data.filename);
        // $("#paramtype").val(data.paramtype);
        // $("#param").val(data.param);
        $("#scriptpath").val(data.scriptpath);
        // $("#runpath").val(data.runpath);
        // $("#command").val("cd " + $("#scriptpath").val() + ";" + $("#runpath").val() + "/" + $("#filename").val() + " " + $("#param").val());
        // $("#maxtime").val(data.maxtime);
        // $("#time").val(data.time);
        $("#success_text").val(data.success_text);
        $("#log_address").val(data.log_address);
    });

    $("#new").click(function () {
        $("#id").val("0");
        $("#code").val("");
        $("#name").val("");
        $("#ip").val("");
        // $("#port").val("");
        $("#username").val("");
        $("#password").val("");
        $("#filename").val("");
        // $("#paramtype").val("无");
        // $("#param").val("");
        $("#scriptpath").val("");
        // $("#runpath").val("");
        // $("#command").val("");
        // $("#maxtime").val("");
        // $("#time").val("");
        $("#success_text").val("");
        $("#log_address").val("");

    });

    $('#save').click(function () {
        var table = $('#sample_1').DataTable();

        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../scriptsave/",
            data:
                {
                    id: $("#id").val(),
                    code: $("#code").val(),
                    name: $("#name").val(),
                    ip: $("#ip").val(),
                    // port: $("#port").val(),
                    type: $("#type").val(),
                    // runtype: $("#runtype").val(),
                    username: $("#username").val(),
                    password: $("#password").val(),
                    filename: $("#filename").val(),
                    // paramtype: $("#paramtype").val(),
                    // param: $("#param").val(),
                    scriptpath: $("#scriptpath").val(),
                    // runpath: $("#runpath").val(),
                    // maxtime: $("#maxtime").val(),
                    // time: $("#time").val(),
                    success_text: $("#success_text").val(),
                    log_address: $("#log_address").val(),
                },
            success: function (data) {
                var myres = data["res"];
                var mydata = data["data"];
                if (myres == "保存成功。") {
                    $("#id").val(data["data"]);
                    $('#static').modal('hide');
                    table.ajax.reload();
                }
                alert(myres);
            },
            error: function (e) {
                alert("页面出现错误，请于管理员联系。");
            }
        });
    })

    //
    // $('#filename').change(function () {
    //     $("#command").val("cd " + $("#scriptpath").val() + ";" + $("#runpath").val() + "/" + $("#filename").val() + " " + $("#param").val());
    // })
    // $('#scriptpath').change(function () {
    //     $("#command").val("cd " + $("#scriptpath").val() + ";" + $("#runpath").val() + "/" + $("#filename").val() + " " + $("#param").val());
    // })
    // $('#runpath').change(function () {
    //     $("#command").val("cd " + $("#scriptpath").val() + ";" + $("#runpath").val() + "/" + $("#filename").val() + " " + $("#param").val());
    // })
    // $('#param').change(function () {
    //     $("#command").val("cd " + $("#scriptpath").val() + ";" + $("#runpath").val() + "/" + $("#filename").val() + " " + $("#param").val());
    // })
    $('#error').click(function () {
        $(this).hide()
    })
});