var add_accountjs = true;

$(document).on('submit', '#form_add_account', function(e){
	e.preventDefault();
	var formdata = $(this).serialize();
	if($('#password').val() == $('#confirm_password').val()) {
		$('.loading-overlay').removeClass('hide');
		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/submit_add_account_form.php",
			data: formdata,
			success: function(result) {
				console.log(result);
				if(result == 'username already exists') {
					M.toast({html: "Username Already Exists!"});
					$('.loading-overlay').addClass('hide');
				}
				else if(result) {
					$('#accounts table>tbody').append('<tr id="row'+result+'>'
						+ '<td>' + $('#username').val() + '</td>'
						+ '<td>' + $('#firstname').val() + '</td>'
						+ '<td>' + $('#lastname').val() + '</td>'
						+ '<td>officer</td>'
						+ '<td><button id="'+result+'" class="edit_account btn blue waves-effect waves-light"><i class="material-icons">edit</i></button><button id="'+result+'" class="delete_account btn red waves-effect waves-light"><i class="material-icons">delete</i></button></td>'
						+ '</tr>');
					$('#add_account_panel').addClass('hide');
					M.toast({html: "Account Successfully Added!"});
					$('.loading-overlay').addClass('hide');
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

$(document).on('click', '#cancel_add_account', function(e){
	e.preventDefault();
	$('#add_account_panel').addClass('hide');
});