var contentsregisteredjs = true;

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