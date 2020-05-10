var edit_accountjs = true;

$(document).on('click', '#cancel_edit_account', function(e){
	e.preventDefault();
	$('#edit_account_panel').addClass('hide');
});

$(document).on('submit', '#form_edit_account', function(e){
	e.preventDefault();
	var formdata = $(this).serialize();
	if($('#edit_password').val() == $('#edit_confirm_password').val()) {
		$('.loading-overlay').removeClass('hide');
		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/submit_edit_account_form.php",
			data: formdata,
			success: function(result) {
				console.log(result);
				if(result == 'username already exists') {
					M.toast({html: "Username Already Exists!"});
					$('.loading-overlay').addClass('hide');
				}
				else if(result) {
					$('#row'+$('#account_id').val()+'>td').eq(0).text($('#edit_username').val());
					$('#row'+$('#account_id').val()+'>td').eq(1).text($('#edit_firstname').val());
					$('#row'+$('#account_id').val()+'>td').eq(2).text($('#edit_lastname').val());
					$('#edit_account_panel').addClass('hide');
					M.toast({html: "Account Successfully Updated!"});
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