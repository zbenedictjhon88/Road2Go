var registerjs = true;

$(document).on('click', '#back_to_login', function(e){
	e.preventDefault();
	showLogin();
});

$(document).on('submit', '#form_register', function(e) {
	e.preventDefault();
	var formdata = $(this).serialize();
	if($('#password').val() == $('#confirm_password').val()) {
		$('.loading-overlay').removeClass('hide');
		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/submit_register_form.php",
			data: formdata,
			success: function(result) {
				console.log(result);
				if(result == 'username already exists') {
					M.toast({html: "Username Already Exists!"});
					$('.loading-overlay').addClass('hide');
				}
				else if(result) {
					$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
						data.account.id = result;
						data.account.firstname = $('#firstname').val();
						data.account.lastname = $('#lastname').val();
						data.account.username = $('#username').val();
						data.account.password = $('#password').val();

						saveJSON(data, "You're now successfully registered!", function(){
							goToRegisteredUser();
							$('.loading-overlay').addClass('hide');
						});
					});
				}
				else {
					M.toast({html: "Something Went Wrong! Try Again."});
					$('.loading-overlay').addClass('hide');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});
	}
	else {
		M.toast({html: 'Password does not match!'});
	}
});