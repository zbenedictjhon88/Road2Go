var pinningjs = true;
var lastSavedZoom = null;
var polyLine = null;
var pinColor = null;

$(document).on('click', '#add_pin', function(e) {
	e.preventDefault();
	isPinningEnabled = true;
	lastSavedZoom = map.getCameraZoom();
	// map.setCameraZoom(19);
	// map.setOptions({
	// 	'gestures': {
	// 		'zoom': false
	// 	}
	// });
	$('#add_pin').addClass('hide');
	$('.pinning-panel>.container>.row').removeClass('hide');
});

$(document).on('click', '#submit_pin', function(e) {
	e.preventDefault();
	$('.loading-overlay').removeClass('hide');
	if(pinColor) {
		$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
			var id = data.account.id;
			var url = null;
			if(data.account.role == "admin") {
				url = "http://holotomyar.com/mobile_requests/road2go/submit_admin_traffic_status.php";
			}
			else {
				url = "http://holotomyar.com/mobile_requests/road2go/submit_traffic_status.php";
			}

			$.ajax({
				type: "POST",
				url: url,
				data: {"user_id" : id, "polyline" : JSON.stringify(polyLineJSON.points), "pin_color" : pinColor},
				success: function(result) {
					console.log(result);
					if(result) {
						polyLine.set("idx", result);
						activePolyLines.push(polyLine);

						saveJSON(data, "Traffic/Road Status successfully submitted!", function(){
							pinColor = null;
							polyLine = null;
							resetPinning();
							$('.loading-overlay').addClass('hide');
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
	}
	else {
		M.toast({html: "Please choose Traffic/Road Status first!"});
	}
});

$(document).on('click', '#ok_pin', function(e) {
	e.preventDefault();
	if(Object.keys(polyLineJSON.points).length > 1) {
		$('#ok_pin').addClass('hide');
		$('#submit_pin').removeClass('hide');
		$('.pinning-color-panel').removeClass('hide');

		for(var i=0;i<Object.keys(polyLineJSON.points).length;i++) {
			circlesArray[i].setVisible(false);
		}
		var id = 0;
		if(activePolyLines.length) {
			id = parseInt(activePolyLines[activePolyLines.length - 1].get('idx')) + 1;
		}
		polyLine = map.addPolyline({
			'idx' : null,
			'points': polyLineJSON.points,
			'color' : '#fff',
			'width': 10,
			'geodesic': true,
			'clickable': true
		}, function(polyline) {
			polyline.on(plugin.google.maps.event.POLYLINE_CLICK, function() {
				console.log(this.get('idx'));
				$('.unpin_button').css('background-color', this.getStrokeColor());
				$('.unpin_button').attr('id', this.get('idx'));
				$('.unpin-panel').removeClass('hide');
			});
		});
	}
	else {
		M.toast({html: "Please put atleast two points first!"});
	}
});

$(document).on('click', '#undo_pin', function(e) {
	e.preventDefault();
	resetPinningStatus();

	if(Object.keys(polyLineJSON.points).length) {
		if(polyLine) {
			polyLine.remove();
			for(var i=0;i<Object.keys(polyLineJSON.points).length;i++) {
				circlesArray[i].setVisible(true);
			}	
			polyLine = null;
		}	
		else {	
			circlesArray[Object.keys(polyLineJSON.points).length - 1].remove();
			circlesArray.pop();
			polyLineJSON.points.pop();
		}
	}
	else {
		M.toast({html: "Nothing to undo!"});
	}
});

$(document).on('click', '#cancel_pinning', function(e) {
	e.preventDefault();
	if(polyLine) {
		polyLine.remove();	
		polyLine = null;
	}
	resetPinning();
});

$(document).on('click', '.pin-label', function(e) {
	e.preventDefault();
	var id = this.id;
	console.log(id);
	switch(id) {
		case 'pin-heavy':
		pinColor = '#F44336';
		break;
		case 'pin-moderate':
		pinColor = '#FFEB3B';
		break;
		case 'pin-light':
		pinColor = '#4CAF50';
		break;
		case 'pin-passable':
		pinColor = '#2196F3';
		break;
		case 'pin-flooding':
		pinColor = '#795548';
		break;
		case 'pin-under-construction':
		pinColor = '#FF5722';
		break;
		case 'pin-road-crash':
		pinColor = '#9e9e9e';
		break;
	}

	polyLine.setStrokeColor(pinColor);
});

$(document).on('click', '.unpin_button', function(e) {
	e.preventDefault();
	var id = this.id;
	console.log(id);
	$('.loading-overlay').removeClass('hide');
	$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
		var url = null;
		if(data.account.role == "admin") {
			url = "http://holotomyar.com/mobile_requests/road2go/delete_traffic_status.php";
		}
		else {
			url = "http://holotomyar.com/mobile_requests/road2go/remove_traffic_status.php";
		}

		$.ajax({
			type: "POST",
			url: url,
			data: {"id" : id},
			success: function(result) {
				console.log(result);
				if(result) {
					$.each(activePolyLines, function(key, value) { 
						if(value.get('idx') == id) {
							activePolyLines[key].remove();
							activePolyLines.splice(key, 1);
							return false; 
						}
					});
					$('.unpin-panel').addClass('hide');
					M.toast({html: "Pin has been successfully removed!"});
					$('.loading-overlay').addClass('hide');
				}
				else {
					M.toast({html: "Something Went Wrong!"});
					$('.loading-overlay').addClass('hide');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});	
	});	
});

function resetPinningStatus() {
	if($('#ok_pin').hasClass('hide')) {	
		$('#submit_pin').addClass('hide');
		$('#ok_pin').removeClass('hide');
		$('.pinning-color-panel').addClass('hide');
	}
}

function resetPinning() {
	isPinningEnabled = false;
	resetPinningStatus();
	$('.pinning-panel>.container>.row').addClass('hide');
	$('#add_pin').removeClass('hide');

	for(var i=0;i<Object.keys(polyLineJSON.points).length;i++) {
		circlesArray[i].remove();
	}
	circlesArray = [];
	polyLineJSON.points = [];
	// map.setCameraZoom(lastSavedZoom);
	// map.setOptions({
	// 	'gestures': {
	// 		'zoom': true
	// 	}
	// });
}