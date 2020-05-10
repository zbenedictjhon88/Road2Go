var contents_adminjs = true;

$(document).on('click', '#add_account_button', function(e){
	e.preventDefault();
	$('#add_account_panel').removeClass('hide');
});

$(document).on('click', '.edit_account', function(e){
	e.preventDefault();
	var id = this.id;
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/get_account_details.php",
		data: {"id" : id},
		success: function(result) {
			console.log(result);
			if(result) {
				result = JSON.parse(result);
				$('#account_id').val(id);
				$('#edit_firstname').val(result.firstname);
				$('#edit_lastname').val(result.lastname);
				$('#edit_username').val(result.username);
				$('#edit_password').val(result.password);
				$('#edit_confirm_password').val(result.password);
				M.updateTextFields();
				$('#edit_account_panel').removeClass('hide');
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
});

$(document).on('click', '.delete_account', function(e){
	e.preventDefault();
	var id = this.id;
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/delete_account.php",
		data: {"id" : id},
		success: function(result) {
			console.log(result);
			if(result) {
				$('#row'+id).remove();
				M.toast({html: "Account Successfully Removed!"});
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
});

$(document).on('keyup', '#search_account', function(e){
	var value = $(this).val().toLowerCase();
	$('#accounts table>tbody tr').filter(function() {
		$(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
	});
});

$(document).on('click', '.approve_traffic_status', function(e){
	e.preventDefault();
	var id = this.id;
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/approve_traffic_status.php",
		data: {"id" : id},
		success: function(result) {
			console.log(result);
			if(result) {
				$('#pin'+id).remove();
				M.toast({html: "Traffic Successfully Approved!"});
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
});

$(document).on('click', '.delete_traffic_status', function(e){
	e.preventDefault();
	var id = this.id;
	$('.loading-overlay').removeClass('hide');
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/delete_traffic_status.php",
		data: {"id" : id},
		success: function(result) {
			console.log(result);
			if(result) {
				$('#pin'+id).remove();
				M.toast({html: "Traffic Successfully Deleted!"});
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
});

$(document).on('click', '#manage_evacuations', function(e){
	e.preventDefault();
	$('#evacuations_panel').removeClass('hide');
});

$(document).on('click', '#logout', function(e){
	e.preventDefault();
	$('.loading-overlay').removeClass('hide');
	$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
		data.account.firstname = data.account.lastname = data.account.username = data.account.password = data.account.role = null;
		saveJSON(data, "You've successfully logged out!", function(){
			goToGuest();
			isLoggedOn = false;
			$('.loading-overlay').addClass('hide');
		});
	});
});