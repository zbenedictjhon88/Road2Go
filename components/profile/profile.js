var profilejs = true;

$(document).on('submit', '#form_profile', function(e) {
	e.preventDefault();
	var formdata = $(this).serialize();
	if($('#password').val() == $('#confirm_password').val()) {
		$('.loading-overlay').removeClass('hide');
		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/submit_update_account_form.php",
			data: formdata,
			success: function(result) {
				console.log(result);
				if(result) {
					$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
						data.account.firstname = $('#firstname').val();
						data.account.lastname = $('#lastname').val();
						data.account.username = $('#username').val();
						data.account.password = $('#password').val();

						saveJSON(data, "Your account was successfully updated!", function(){
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

$(document).on('click', '#back_to_home', function(e) {
	e.preventDefault();
	$('.profile-panel').addClass('hide');
});