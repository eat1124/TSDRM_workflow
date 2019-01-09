$(document).ready(function () {
    $('#sample_1').dataTable({
        "bAutoWidth": true,
        "bSort": false,
        "bProcessing": true,
        "ajax": "../falconstorsearchdata?runstate=" + $('#runstate').val() + "&startdate=" + $('#startdate').val() + "&enddate=" + $('#enddate').val() + "&processname=" + $('#processname').val() + "&runperson=" + $('#runperson').val(),
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

    $('#startdate').datetimepicker({
        autoclose: true,
        minView: "month",
        format: 'yyyy-mm-dd',
    });
    $('#enddate').datetimepicker({
        autoclose: true,
        minView: "month",
        format: 'yyyy-mm-dd',
    });
    $('#cx').click(function () {
        var table = $('#sample_1').DataTable();
        table.ajax.url("../falconstorsearchdata?runstate=" + $('#runstate').val() + "&startdate=" + $('#startdate').val() + "&enddate=" + $('#enddate').val() + "&processname=" + $('#processname').val() + "&runperson=" + $('#runperson').val()).load();
    })

});