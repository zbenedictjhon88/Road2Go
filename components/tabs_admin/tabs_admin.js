var tabs_adminjs = true;
var current_tab = 1;

$(document).on('click', '#home_tab', function(e) {
	e.preventDefault();
	if(current_tab != 1) {
		showAllPolyLines();
		$('#accounts').addClass('hide');
		$('#pins').addClass('hide');
		$('#dest-evac').removeClass('hide');
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').addClass('hide');
		current_tab = 1;
	}
});

$(document).on('click', '#road_status_tab', function(e) {
	e.preventDefault();
	if(current_tab != 2) {
		showAdminPolyLines();
		$('#accounts').addClass('hide');
		$('#pins').addClass('hide');
		$('#dest-evac').removeClass('hide');
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').removeClass('hide');
		current_tab = 2;
	}
});

$(document).on('click', '#accounts_tab', function(e) {
	e.preventDefault();
	if(current_tab != 3) {
		$('#pins').addClass('hide');
		$('#dest-evac').addClass('hide');
		$('#accounts').removeClass('hide');
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').addClass('hide');
		current_tab = 3;
	}
});

$(document).on('click', '#pins_tab', function(e) {
	e.preventDefault();
	if(current_tab != 4) {
		$('#accounts').addClass('hide');
		$('#dest-evac').addClass('hide');
		$('#pins').removeClass('hide');
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').addClass('hide');
		current_tab = 4;
	}
});

$(document).on('click', '#menu_tab', function(e) {
	e.preventDefault();
	if(current_tab != 5) {
		$('.menu-panel').removeClass('hide');
		current_tab = 5;
	}
});