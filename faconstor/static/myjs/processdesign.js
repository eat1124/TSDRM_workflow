$(document).ready(function () {
    function customProcessData() {
        $('#sample_1').dataTable({
            "bAutoWidth": true,
            "bSort": false,
            "bProcessing": true,
            "ajax": "../process_data?process_level=" + $("#level_change").val(),
            "columns": [
                {"data": "process_id"},
                {"data": "process_code"},
                {"data": "process_name"},
                {"data": "process_level_value"},
                {"data": "process_remark"},
                {"data": "process_sign"},
                {"data": "process_rto"},
                {"data": "process_rpo"},
                {"data": "process_sort"},
                {"data": "process_color"},
                {"data": "process_state"},
                {"data": "process_level_key"},
                {"data": null}
            ],

            "columnDefs": [{
                "targets": 2,
                "render": function (data, type, full) {
                    return "<td><a href='/processdraw/processid'>data</a></td>".replace("processid", full.process_id).replace("data", full.process_name)
                }
            }, {
                "targets": 5,
                "render": function (data, type, full) {
                    var process_sign = "否"
                    if (full.process_sign == "1") {
                        var process_sign = "是"
                    }
                    return "<td>process_sign</td>".replace("process_sign", process_sign);
                }
            }, {
                "visible": false,
                "targets": -2  // 倒数第一列
            }, {
                "targets": -1,
                "data": null,
                "width": "140px",
                "defaultContent": "<button title='流程'  id='flow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-cog'></i></button><button  id='edit' title='编辑' data-toggle='modal'  data-target='#static'  class='btn btn-xs btn-primary' type='button'><i class='fa fa-edit'></i></button><button title='复制' data-toggle='modal'  data-target='#copystatic' id='copy' class='btn btn-xs btn-primary' type='button'><i class='fa fa-copy'></i></button><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button>"
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
    }

    // 构造dataTable
    customProcessData();
    // 工作流
    $('#sample_1 tbody').on('click', 'button#flow', function () {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        window.location.href = "../processdraw/" + data.process_id + "/";
    });
    // 删除行
    $('#sample_1 tbody').on('click', 'button#delrow', function () {
        if (confirm("确定要删除该条数据？")) {
            var table = $('#sample_1').DataTable();
            var data = table.row($(this).parents('tr')).data();
            $.ajax({
                type: "POST",
                url: "../process_del/",
                data:
                    {
                        id: data.process_id,
                    },
                success: function (data) {
                    if (data == 1) {
                        table.ajax.reload();
                        alert("删除成功！");
                    } else
                        alert("删除失败，请于管理员联系。");
                },
                error: function (e) {
                    alert("删除失败，请于管理员联系。");
                }
            });

        }
    });
    // 编辑行
    $('#sample_1 tbody').on('click', 'button#edit', function () {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        $("#id").val(data.process_id);
        $("#code").val(data.process_code);
        $("#name").val(data.process_name);
        $("#remark").val(data.process_remark);
        $("#sign").val(data.process_sign);
        $("#rto").val(data.process_rto);
        $("#rpo").val(data.process_rpo);
        $("#sort").val(data.process_sort);
        $("#process_color").val(data.process_color);
        $("#level").val(data.process_level_key);
    });
    // 拷贝流程
    $('#sample_1 tbody').on('click', 'button#copy', function () {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        $("#copyid").val(data.process_id);
        $("#copycode").val(data.process_code);
        $("#copyname").val(data.process_name);
        $("#copyrto").val(data.process_rto);
        $("#copyrpo").val(data.process_rpo);
        $("#copyremark").val(data.process_remark);
        $("#copy_sort").val(data.process_sort);
        $("#copy_process_color").val(data.process_color);
        if (data.process_sign == "1") {
            $('input:radio[name=copyradio2]')[0].checked = true;
        } else {
            $('input:radio[name=copyradio2]')[1].checked = true;
        }
    });

    $("#new").click(function () {
        $("#id").val("0");
        $("#code").val("");
        $("#name").val("");
        $("#remark").val("");
        $("#sign").val("");
        $("#rto").val("");
        $("#rpo").val("");
        $("#sort").val("");
        $("#process_color").val("");
        $("#level").val("");
    });

    $('#save').click(function () {
        var table = $('#sample_1').DataTable();

        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../process_save/",
            data:
                {
                    id: $("#id").val(),
                    code: $("#code").val(),
                    name: $("#name").val(),
                    remark: $("#remark").val(),
                    sign: $("#sign").val(),
                    rto: $("#rto").val(),
                    rpo: $("#rpo").val(),
                    sort: $("#sort").val(),
                    color: $("#process_color").val(),
                    level: $("#level").val(),
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

    // 保存拷贝流程
    $('#copysave').click(function () {
        var table = $('#sample_1').DataTable();
        $.ajax({
            type: "POST",
            dataType: 'json',
            url: "../processcopy/",
            data:
                {
                    id: $("#copyid").val(),
                    code: $("#copycode").val(),
                    name: $("#copyname").val(),
                    rto: $("#copyrto").val(),
                    rpo: $("#copyrpo").val(),
                    remark: $("#copyremark").val(),
                    sort: $("#copy_sort").val(),
                    color: $("#copy_process_color").val(),
                    sign: $("input[name='copyradio2']:checked").val()
                },
            success: function (data) {
                var myres = data["res"];
                var mydata = data["data"];
                if (myres == "复制成功。") {
                    $('#copystatic').modal('hide');
                    table.ajax.reload();
                }
                alert(myres);
            },
            error: function (e) {
                alert("页面出现错误，请于管理员联系。");
            }
        });
    });

    // 选择流程
    $("#level_change").change(function () {
        $("#sample_1").DataTable().destroy();
        customProcessData();
    });

    $('#error').click(function () {
        $(this).hide()
    })
});