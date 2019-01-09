var Login = function () {

	var handleLogin = function() {
		$('.login-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            rules: {
	                username: {
	                    required: true
	                },
	                password: {
	                    required: true
	                },
	                remember: {
	                    required: false
	                }
	            },

	            messages: {
	                username: {
	                    required: "请输入用户名。"
	                },
	                password: {
	                    required: "请输入密码。"
	                }
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
	                error.insertAfter(element.closest('.input-icon'));
	            },

	            submitHandler: function (form) {
	                form.submit();
	            }
	        });


	}

	var handleForgetPassword = function () {
		$('.forget-form').validate({
	            errorElement: 'span', //default input error message container
	            errorClass: 'help-block', // default input error message class
	            focusInvalid: false, // do not focus the last invalid input
	            ignore: "",
	            rules: {
	                email: {
	                    required: true,
	                    email: true
	                }
	            },

	            messages: {
	                email: {
	                    required: "请输入正确的邮箱格式。"
	                }
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
	                error.insertAfter(element.closest('.input-icon'));
	            },

	            submitHandler: function (form) {
	                form.submit();
	            }
	        });



	        jQuery('#forget-password').click(function () {
	            jQuery('.login-form').hide();
	            jQuery('.forget-form').show();
	        });

	        jQuery('#back-btn').click(function () {
	            jQuery('.login-form').show();
	            jQuery('.forget-form').hide();
	        });

	}

    
    return {
        //main function to initiate the module
        init: function () {
        	
            handleLogin();
            handleForgetPassword();

            // init background slide images
		    /*$.backstretch([
		        "/static/assets/pages/media/bg/1.jpg",
		        "/static/assets/pages/media/bg/2.jpg",
		        "/static/assets/pages/media/bg/3.jpg",
		        "/static/assets/pages/media/bg/4.jpg"
		        ], {
		          fade: 1000,
		          duration: 8000
		    	}
        	);*/
        }
    };

}();

jQuery(document).ready(function() {
    Login.init();


});


$('#loginbtn').click(function(){

    if($("#formlogin").validate().form())
        $.ajax({
            type: "POST",
            url: "../userlogin/",
            data: $('#formlogin').serialize(),
            success:function(data){
                if(data=="success")
                {
                    window.location.href = '../index/';
                }
                else if(data=="success1")
                {
                    window.location.href = '../activate/';
                }
                else
                {
                    alert(data);
                    $('#password').val("");
                }
            },
            error : function(e){
                $('#password').val("");
                alert("登录失败，请于客服联系。");
            }
        });
     else
        alert("请输入用户名和密码。");
 })

 $('#forgetbtn').click(function(){

    if($("#formforget").validate().form())
        $.ajax({
            type: "POST",
            url: "../forgetPassword/",
            data: $('#formforget').serialize(),
            success:function(data){
                    alert(data);
            },
            error : function(e){
                alert("邮编发送失败，请于客服联系。");
            }
        });
     else
        alert("请输入正确的邮箱地址。");
 })
