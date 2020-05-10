var contents_officerjs = true;

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

$(document).on('click', '#edit_profile', function(e){
	e.preventDefault();
	$('.profile-panel').removeClass('hide');
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