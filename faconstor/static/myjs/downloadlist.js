$('#sample_1').dataTable({
    "bAutoWidth": true,
    "bSort": false,
    "bProcessing": true,
    "ajax": "../download_list_data/",
    "columns": [
        {"data": "id"},
        {"data": "name"},
        {"data": "up_time"},
        {"data": "remark"},
        {"data": "file_name"},
        {"data": null}
    ],

    "columnDefs": [{
        "targets": -1,  // 指定最后一列添加按钮；
        "data": null,
        "width": "60px",  // 指定列宽；
        "render": function (data, type, full) {
            return "<td><button class='btn btn-xs btn-primary' type='button'><a href='/download/?file_id'><i class='fa fa-arrow-circle-down' style='color: white'></i></a></button><button title='删除'  id='delrow' class='btn btn-xs btn-primary' type='button'><i class='fa fa-trash-o'></i></button></td>".replace("file_id", "file_id=" + full.id)
        }
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
// 删除
$('#sample_1 tbody').on('click', 'button#delrow', function () {
    if (confirm("确定要删除该条数据？")) {
        var table = $('#sample_1').DataTable();
        var data = table.row($(this).parents('tr')).data();
        $.ajax({
            type: "POST",
            url: "../knowledge_file_del/",
            data:
                {
                    id: data.id,
                },
            success: function (data) {
                if (data.data === "删除成功。") {
                    table.ajax.reload();
                    alert(data.data);
                }
                else
                    alert(data.data);
            },
            error: function (e) {
                alert("删除失败，请于管理员联系。");
            }
        });

    }
});

// 新增
$("#new").click(function () {
    $("#file_remark").val("");
});

$('#error').click(function () {
    $(this).hide()
});