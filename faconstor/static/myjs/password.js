var Reset = function () {


	var handleReset = function () {


         $('.reset-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            ignore: "",
	            rules: {
	                oldpassword: {
	                    required: true
	                },
	                password: {
	                    required: true
	                },
	                rpassword: {
	                    equalTo: "#register_password"
	                },
	            },

	            messages: { // custom messages for radio buttons and checkboxes
	            },

	            invalidHandler: function (event, validator) { //display error alert on form submit   

	            },

	            highlight: function (element) { // hightlight error inputs
	                $(element)
	                    .closest('.form-group').addClass('has-error'); // set error class to the control group
	            },

	            success: function (label) {
	                label.closest('.form-group').removeClass('has-error');
	                label.remove();
	            },

	            errorPlacement: function (error, element) {
	                if (element.closest('.input-icon').size() === 1) {
	                    error.insertAfter(element.closest('.input-icon'));
	                } else {
	                	error.insertAfter(element);
	                }
	            },

	            submitHandler: function (form) {
	                form.submit();
	            }
	        });



	}
    
    return {
        //main function to initiate the module
        init: function () {

            handleReset();

            // init background slide images
		    $.backstretch([
		        "/static/assets/pages/media/bg/1.jpg",
		        "/static/assets/pages/media/bg/2.jpg",
		        "/static/assets/pages/media/bg/3.jpg",
		        "/static/assets/pages/media/bg/4.jpg"
		        ], {
		          fade: 1000,
		          duration: 8000
		    	}
        	);
        }
    };

}();

jQuery(document).ready(function() {
    Reset.init();


});

 $('#resetbtn').click(function(){
    if($("#formreset").validate().form())
        $.ajax({
            type: "POST",
            url: "../../userpassword/",
            data: $('#formreset').serialize(),
            success:function(data){
                if(data=="success")
                    window.location.href = '../../index/';
                else
                {
                    alert(data);
                    $('#oldpassword').val("");
                    $('#register_password').val("");
                    $('#rpassword').val("");
                }
            },
            error : function(e){
                $('#oldpassword').val("");
                $('#register_password').val("");
                $('#rpassword').val("");
                alert("密码修改失败，请于客服联系。");
            }
        });
     else
        alert("输入有误，请重新输入。");
 })