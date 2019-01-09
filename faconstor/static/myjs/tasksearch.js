$(document).ready(function () {
    $('#sample_1').dataTable({
        "bAutoWidth": true,
        "bSort": false,
        "bProcessing": true,
        "ajax": "../tasksearchdata?task_type=" + $('#task_type').val() + "&startdate=" + $('#startdate').val() + "&enddate=" + $('#enddate').val() + "&has_finished=" + $('#has_finished').val(),
        "columns": [
            {"data": "task_id"},
            {"data": "process_name"},
            {"data": "task_content"},
            {"data": "type"},
            {"data": "has_finished"},
            {"data": "starttime"},
            {"data": "endtime"},
            {"data": "processrun_id"},
            {"data": "process_url"},
        ],
        "columnDefs": [{
            "targets": 2,
            "render": function (data, type, full) {
                return "<td><a href='process_url'>data</a></td>".replace("data", full.task_content).replace("process_url", full.process_url + "/" + full.processrun_id)
            }
        }, {
            "visible": false,
            "targets": -1  // 倒数第一列
        }, {
            "visible": false,
            "targets": -2  // 倒数第一列
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
        table.ajax.url("../tasksearchdata?task_type=" + $('#task_type').val() + "&startdate=" + $('#startdate').val() + "&enddate=" + $('#enddate').val() + "&has_finished=" + $('#has_finished').val()).load();
    })

});