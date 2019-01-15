$(function(){

    $('#tree_2').jstree({

                'core': {
                    "themes" : {
                        "responsive": false
                    },
                    "check_callback" : true,
                    'data': treedata
                },

                "types" : {
                    "org" : {
                        "icon" : "fa fa-folder icon-state-warning icon-lg"
                    },
                    "user" : {
                        "icon" : "fa fa-file icon-state-warning icon-lg"
                    }
                },
                "contextmenu":{
                    "items":{
                        "create":null,
                        "rename":null,
                        "remove":null,
                        "ccp":null,
                        "新建场景":{
                            "label":"新建场景",
                            "action":function(data){
                                var inst = jQuery.jstree.reference(data.reference),
                                obj = inst.get_node(data.reference);
                                $("#title").text("新建")
                                $("#id").val("0")
                                $("#pid").val(obj.id)
                                $("#pname").val(obj.text)
                                $("#code").val("")
                                $("#name").val("")
                                $("#remark").val("")
                                $("#business").val("")
                                $("#application").val("")
                                $("#my_multi_select1").empty();
                                for(var i=0;i<obj.data.myallprocess.length;i++)
                                    {
                                        $("#my_multi_select1").append("<option value='" + obj.data.myallprocess[i].id + "' >" + obj.data.myallprocess[i].name + "(" + obj.data.myallprocess[i].code  + ")</option>");
                                     }
                                $('#my_multi_select1').multiSelect('refresh');
                                $("#save").show()
                            }
                        },
                        "删除":{
                            "label":"删除",
                            "action":function(data){
                                var inst = jQuery.jstree.reference(data.reference),
                                obj = inst.get_node(data.reference);
                                if(obj.children.length>0)
                                    alert("场景下还有其他场景，无法删除。");
                                else{
                                    if(confirm("确定要删除？删除后不可恢复。")){
                                        $.ajax({
                                            type: "POST",
                                            url: "../scenedel/",
                                            data:
                                                {
                                                  id:obj.id,
                                                },
                                            success:function(data){
                                            if(data==1)
                                            {
                                                inst.delete_node(obj);
                                                alert("删除成功！");
                                            }
                                            else
                                            alert("删除失败，请于管理员联系。");
                                            },
                                            error : function(e){
                                                 alert("删除失败，请于管理员联系。");
                                                }
                                      });
                                    }
                                }
                            }
                        },

                    }
                },
                "plugins" : [ "contextmenu","dnd", "types","role" ]
            })
    .on('move_node.jstree', function(e,data){
                var moveid=data.node.id;
                if (data.old_parent=="#"){
                    alert("根节点禁止移动。");
                    location.reload()}
                else{
                    if (data.parent=="#"){
                        alert("禁止新建根节点。");
                        location.reload()}
                    else{
                        $.ajax({
                            type: "POST",
                            url: "../scenemove/",
                            data:
                                {
                                  id:data.node.id,
                                  parent:data.parent,
                                  old_parent:data.old_parent,
                                  position:data.position,
                                  old_position:data.old_position,
                                },
                            success:function(data){
                                if(data=="重名")
                                {
                                    alert("目标场景下存在重名。");
                                     location.reload()
                                }
                                else
                                {
                                    if(data!="0")
                                    {
                                        var selectid= $("#id").val()
                                        if(selectid==moveid)
                                        {
                                            var res = data.split('^')
                                            $("#pid").val(res[1])
                                            $("#pname").val(res[0])
                                        }

                                    }
                                }
                            },
                            error : function(e)
                            {
                                 alert("移动失败，请于管理员联系。");
                                 location.reload()
                            }
                        });


                    }
                }
            })
     .bind('select_node.jstree', function(event,data) {
            $("#formdiv").show()

            $("#id").val(data.node.id)
            $("#pid").val(data.node.parent)
            $("#pname").val(data.node.data.pname)
            $("#title").text(data.node.text)
            $("#my_multi_select1").empty();
            for(var i=0;i<data.node.data.selectprocess.length;i++)
                {
                    $("#my_multi_select1").append("<option selected value='" + data.node.data.selectprocess[i].id + "' >" + data.node.data.selectprocess[i].name + "("  +data.node.data.selectprocess[i].code  +  ")</option>");
                 }
            for(var i=0;i<data.node.data.noselectprocess.length;i++)
                {
                    $("#my_multi_select1").append("<option value='" + data.node.data.noselectprocess[i].id + "' >" + data.node.data.noselectprocess[i].name + "(" + data.node.data.noselectprocess[i].code  + ")</option>");
                 }

            $('#my_multi_select1').multiSelect('refresh');

            $("#code").val(data.node.data.code)
            $("#name").val(data.node.text)
            $("#remark").val(data.node.data.remark)
            $("#business").val(data.node.data.business)
            $("#application").val(data.node.data.application)
            if(data.node.parent=="#")
            {
                $("#save").hide()
            }
            else
            {
                $("#save").show()
            }

            });

    $("#error").click(function(){
      $(this).hide();
    });

$('#my_multi_select1').multiSelect({
      selectableHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='未选择'>",
      selectionHeader: "<input type='text' class='search-input' autocomplete='off' placeholder='已选择'>",
      afterInit: function(ms){
        var that = this,
            $selectableSearch = that.$selectableUl.prev(),
            $selectionSearch = that.$selectionUl.prev(),
            selectableSearchString = '#'+that.$container.attr('id')+' .ms-elem-selectable:not(.ms-selected)',
            selectionSearchString = '#'+that.$container.attr('id')+' .ms-elem-selection.ms-selected';

        that.qs1 = $selectableSearch.quicksearch(selectableSearchString)
        .on('keydown', function(e){
          if (e.which === 40){
            that.$selectableUl.focus();
            return false;
          }
        });

        that.qs2 = $selectionSearch.quicksearch(selectionSearchString)
        .on('keydown', function(e){
          if (e.which == 40){
            that.$selectionUl.focus();
            return false;
          }
        });
      },
      afterSelect: function(){
        this.qs1.cache();
        this.qs2.cache();
      },
      afterDeselect: function(){
        this.qs1.cache();
        this.qs2.cache();
      }
    });


});