var tabsregisteredjs = true;
var current_tab = 1;

$(document).on('click', '#home_tab', function(e) {
	e.preventDefault();
	if(current_tab != 1) {
		showAllPolyLines();
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').addClass('hide');
		current_tab = 1
	}
});

$(document).on('click', '#road_status_tab', function(e) {
	e.preventDefault();
	if(current_tab != 2) {
		showUsersPolyLines();
		$('.menu-panel').addClass('hide');
		$('.pinning-panel').removeClass('hide');
		current_tab = 2
	}
});

$(document).on('click', '#menu_tab', function(e) {
	e.preventDefault();
	if(current_tab != 3) {
		$('.menu-panel').removeClass('hide');
		current_tab = 3
	}
});