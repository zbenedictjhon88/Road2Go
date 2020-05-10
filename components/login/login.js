var loginjs = true;

$(document).on('submit', '#form_login', function(e){
	e.preventDefault();
	var formdata = $(this).serialize();
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/submit_login_form.php",
		data: formdata,
		success: function(result) {
			console.log(result);
			if(result == 'invalid email or password') {
				M.toast({html: "Invalid Email or Password! Try Again."});
				$('.loading-overlay').addClass('hide');
			}
			else if(result) {
				result = JSON.parse(result);
				$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
					data.account.id = result.account.id;
					data.account.firstname = result.account.firstname;
					data.account.lastname = result.account.lastname;
					data.account.username = result.account.username;
					data.account.password = result.account.password;
					data.account.role = result.account.role;

					saveJSON(data, "You're successfully logged-in!", function(){
						switch(result.account.role) {
							case "admin":
							goToAdmin();
							break;
							case "officer":
							goToOfficer();
							break;
							case "user":
							goToRegisteredUser();
							break;
						}
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
});

$(document).on('click', '#register', function(e){
	e.preventDefault();
	showRegister();
});