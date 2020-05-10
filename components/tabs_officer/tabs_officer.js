var tabs_officerjs = true;
var current_tab = 1;

$(document).on('click', '#home_tab', function(e) {
	e.preventDefault();
	if(current_tab != 1) {
		showAllPolyLines();
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
		$('#pins').addClass('hide');
		$('#dest-evac').removeClass('hide');
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').removeClass('hide');
		current_tab = 2;
	}
});

$(document).on('click', '#pins_tab', function(e) {
	e.preventDefault();
	if(current_tab != 3) {
		$('#dest-evac').addClass('hide');
		$('#pins').removeClass('hide');
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').addClass('hide');
		current_tab = 3;
	}
});

$(document).on('click', '#menu_tab', function(e) {
	e.preventDefault();
	if(current_tab != 4) {
		$('.menu-panel').removeClass('hide');
		current_tab = 4;
	}
});