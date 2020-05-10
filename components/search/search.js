var searchjs = true;

$(document).on('keypress', '#destination_input', function(e){
	if(e.which === 13) {
		if(isLoggedOn && current_tab == 2) {
			getLatLng($(this).val(), function(location){
				map.animateCamera({
					target : location,
					zoom: 19
				});
			});
		}
		else {
			searchDestination($(this).val());
		}
	}
});

$(document).on('change', 'input:radio[name="dest-evac"]', function(e){
	e.preventDefault();
	console.log($(this).val());
	switch($(this).val()) {
		case 'destination':
		$('#dest-evac-search div.select-wrapper').addClass('hide');
		$('#dest-evac-search>div>input').removeClass('hide');
		break;
		case 'evacuation':
		$('#dest-evac-search>div>input').addClass('hide');
		$('#dest-evac-search div.select-wrapper').removeClass('hide');
		break;
	}
	$('#map_canvas').css('top', $('header').height() + $('#dest-evac').height() + 'px');
});

$(document).on('change', '#dest-evac-search select', function(e){
	e.preventDefault();
	if(isLoggedOn && current_tab == 2) {
		getLatLng($(this).val(), function(location){
			map.animateCamera({
				target : location,
				zoom: 19
			});
		});
	}
	else {
		searchDestination($(this).val());
	}
});