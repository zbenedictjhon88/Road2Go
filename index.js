var map = null;
var latLngBounds = null;
var isLoggedOn = false;
var activePolyLines = [];
var destinationPolyLine = null;
var routePoints = [];
var lastTimeBackPress = 0;

document.addEventListener("deviceready", function() {
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory + 'config.json', function() {
		$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
			if(data.account.username && data.account.password) {
				switch(data.account.role) {
					case "admin":
					goToAdmin();
					break;
					case "officer":
					goToOfficer();
					break;
					case "user":
					goToRegisteredUser();
					break;
				}
			}
			else {
				goToGuest();
			}
		});
	}, function() {
		$.getJSON('data/config.json', function(data){
			saveJSON(data, 'Welcome to Road2Go', function(){
				goToGuest();
			});
		});
	});

	document.addEventListener("backbutton", function(e){
		e.preventDefault();
		e.stopPropagation();
		if(new Date().getTime() - lastTimeBackPress < 2000){
			navigator.app.exitApp();
		}
		else {
			window.plugins.toast.showWithOptions({
				message: "Press again to exit.",
				duration: "short",
				position: "bottom",
				addPixelsY: -40
			});

			lastTimeBackPress = new Date().getTime();
		}
	}, false);
}, false);

function saveJSON(data, toast, callback) {
	window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
		dir.getFile('config.json', {create:true}, function(file) {
			file.createWriter(function(fileWriter) {
				fileWriter.write(data);
				M.toast({html: toast});
				callback();
			}, function(){
				console.log('Unable to save file in path '+ cordova.file.externalDataDirectory);
			});
		});
	});
}

function showNavbar() {
	$.get('components/navbar/navbar.html', function(data){ 
		$('header').html(data);
	});
}

function showTabsGuest() {
	$.get('components/tabs_guest/tabs_guest.html', function(data){ 
		$('header').append(data);
	});
}

function showTabsRegistered() {
	$.get('components/tabs_registered/tabs_registered.html', function(data){ 
		$('header').append(data);

		if(typeof window.tabsregisteredjs == 'undefined') {
			$.getScript('components/tabs_registered/tabs_registered.js');
		}
	});
}

function showTabsAdmin() {
	$.get('components/tabs_admin/tabs_admin.html', function(data){ 
		$('header').append(data);

		if(typeof window.tabs_adminjs == 'undefined') {
			$.getScript('components/tabs_admin/tabs_admin.js');
		}
	});
}

function showTabsOfficer() {
	$.get('components/tabs_officer/tabs_officer.html', function(data){ 
		$('header').append(data);

		if(typeof window.tabs_officerjs == 'undefined') {
			$.getScript('components/tabs_officer/tabs_officer.js');
		}
	});
}

function showContentsGuest() {
	$.get('components/contents_guest/contents_guest.html', function(data){ 
		$('main').html(data);
		$('.tabs').tabs();

     // if(typeof window.contentjs == 'undefined') {
     //   $.getScript('components/content/content.js');
     // }
 });
}

function showContentsRegistered() {
	$.get('components/contents_registered/contents_registered.html', function(data){ 
		$('main').html(data);

		$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
			$('#user_name').text(data.account.username);
		});

		$('.tabs').tabs();

		if(typeof window.contentsregisteredjs == 'undefined') {
			$.getScript('components/contents_registered/contents_registered.js');
		}
	});
}

function showContentsAdmin() {
	$.get('components/contents_admin/contents_admin.html', function(data){ 
		$('main').html(data);

		$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
			$('#user_name').text(data.account.username);
		});

		$('.tabs').tabs();

		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/get_accounts.php",
			data: true,
			success: function(result) {
				console.log(result);
				if(result) {
					result = JSON.parse(result);
					for(var i=0;i<result.length;i++) {
						$('#accounts table>tbody').append('<tr id="row'+result[i].id+'">'
							+ '<td>' + result[i].username + '</td>'
							+ '<td>' + result[i].firstname + '</td>'
							+ '<td>' + result[i].lastname + '</td>'
							+ '<td>' + result[i].role + '</td>'
							+ '<td><button id="'+result[i].id+'" class="edit_account btn blue waves-effect waves-light" '+(result[i].role=="user"?'disabled':'')+'><i class="material-icons">edit</i></button><button id="'+result[i].id+'" class="delete_account btn red waves-effect waves-light" '+(result[i].role=="user"?'disabled':'')+'><i class="material-icons">delete</i></button></td>'
							+ '</tr>');
					}
				}
				else {
					$('#accounts table>tbody').append('<tr><td colspan="5">No Record Found!</td></tr>');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});

		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/get_requested_traffic_status.php",
			data: true,
			success: function(result) {
				console.log(result);
				if(result) {
					result = JSON.parse(result);
					var traffic_status = null;
					for(var i=0;i<result.length;i++) {
						getPlaceName(JSON.parse(result[i].polyline)[0], i, function(address, index){
							switch(result[index].pincolor) {
								case '#F44336':
								traffic_status = 'Heavy';
								break;
								case '#FFEB3B':
								traffic_status = 'Moderate';
								break;
								case '#4CAF50':
								traffic_status = 'Light';
								break;
								case '#2196F3':
								traffic_status = 'Passable';
								break;
								case '#795548':
								traffic_status = 'Flooding';
								break;
								case '#FF5722':
								traffic_status = 'Under Construction';
								break;
								case '#9e9e9e':
								traffic_status = 'Road Crash';
								break;
							}
							$('#pins table>tbody').append('<tr id="pin'+result[index].id+'">'
								+ '<td>' + result[index].username + '</td>'
								+ '<td>' + address + '</td>'
								+ '<td>' + traffic_status + '</td>'
								+ '<td><button id="'+result[index].id+'" class="'+(result[index].status=="pending"?'approve_traffic_status':'delete_traffic_status')+' btn blue waves-effect waves-light"><i class="material-icons">'+(result[index].status=="pending"?'check':'delete')+'</i></button></td>'
								+ '</tr>');
						});
					}
				}
				else {
					$('#pins table>tbody').append('<tr><td colspan="4">No Record Found!</td></tr>');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});

		if(typeof window.contents_adminjs == 'undefined') {
			$.getScript('components/contents_admin/contents_admin.js');
		}
	});
}

function showContentsOfficer() {
	$.get('components/contents_officer/contents_officer.html', function(data){ 
		$('main').html(data);

		$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
			$('#user_name').text(data.account.username);
		});

		$('.tabs').tabs();

		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/get_requested_traffic_status.php",
			data: true,
			success: function(result) {
				console.log(result);
				if(result) {
					result = JSON.parse(result);
					var traffic_status = null;
					for(var i=0;i<result.length;i++) {
						getPlaceName(JSON.parse(result[i].polyline)[0], i, function(address, index){
							switch(result[index].pincolor) {
								case '#F44336':
								traffic_status = 'Heavy';
								break;
								case '#FFEB3B':
								traffic_status = 'Moderate';
								break;
								case '#4CAF50':
								traffic_status = 'Light';
								break;
								case '#2196F3':
								traffic_status = 'Passable';
								break;
								case '#795548':
								traffic_status = 'Flooding';
								break;
								case '#FF5722':
								traffic_status = 'Under Construction';
								break;
								case '#9e9e9e':
								traffic_status = 'Road Crash';
								break;
							}
							$('#pins table>tbody').append('<tr id="pin'+result[index].id+'">'
								+ '<td>' + result[index].username + '</td>'
								+ '<td>' + address + '</td>'
								+ '<td>' + traffic_status + '</td>'
								+ '<td><button id="'+result[index].id+'" class="'+(result[index].status=="pending"?'approve_traffic_status':'delete_traffic_status')+' btn blue waves-effect waves-light"><i class="material-icons">'+(result[index].status=="pending"?'check':'delete')+'</i></button></td>'
								+ '</tr>');
						});
					}
				}
				else {
					$('#pins table>tbody').append('<tr><td colspan="4">No Record Found!</td></tr>');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});

		if(typeof window.contents_officerjs == 'undefined') {
			$.getScript('components/contents_officer/contents_officer.js');
		}
	});
}

function showSearch() {
	$.get('components/search/search.html', function(data){ 
		$('#home').html(data);

		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/get_evacuations.php",
			data: true,
			success: function(result) {
				console.log(result);
				if(result) {
					result = JSON.parse(result);
					for(var i=0;i<result.length;i++) {
						$('#dest-evac-search select').append('<option value="'+result[i].evacuation_name+'">'+result[i].evacuation_name+'</option>');
					}
					$('select').formSelect();
					$('#dest-evac-search div.select-wrapper').addClass('hide');
					$('.select-wrapper input.select-dropdown').addClass('mb-0');
				}
				else {
					$('#evacuations_panel table>tbody').append('<tr><td colspan="2">No Record Found!</td></tr>');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});

		if(typeof window.searchjs == 'undefined') {
			$.getScript('components/search/search.js');
		}
	});
}

function showMap() {
	$.get('components/map/map.html', function(data){ 
		$('#home').append(data);
		map = plugin.google.maps.Map.getMap($('#map_canvas')[0], {
			'camera': {
				target: {lat: 17.6029987, lng: 121.76294440000001},
				zoom: 12
			},
			'preferences': {
				'zoom': {
					'minZoom': 12,
					'maxZoom': 20
				}
			}
		});
		map.one(plugin.google.maps.event.MAP_READY, function(map) {
				// map.getMyLocation(
				// 	function(location) {
				// 		map.animateCamera({
				// 			target: location.latLng,
				// 			zoom: 16
				// 		});
				// 	}, 
				// 	function(msg) {
				// 		console.log(JSON.stringify(msg));
				// 	});
				$.getJSON('data/data.json', function(data){
					latLngBounds = new plugin.google.maps.LatLngBounds(data.points);
					var bounds = {
						north : latLngBounds.northeast.lat,
						south : latLngBounds.southwest.lat,
						east : latLngBounds.northeast.lng,
						west : latLngBounds.southwest.lng
					};
					var expand = 0.30;
					var rectangle = [
					{ "lat": bounds.north + expand, "lng": bounds.west - expand },
					{ "lat": bounds.south - expand, "lng": bounds.west - expand },
					{ "lat": bounds.south - expand, "lng": bounds.east + expand },
					{ "lat": bounds.north + expand, "lng": bounds.east + expand },
					];
					map.addPolygon({
						points: rectangle,
						holes: data.points,
						strokeColor: "#00C853",
						strokeWidth: 3,
						fillColor: "#BDBDBD"
					});
					map.animateCamera({
						target : latLngBounds.getCenter(),
						zoom : 15
					});

					showAllPolyLines();
				});
			});
		if(typeof window.mapjs == 'undefined') {
			$.getScript('components/map/map.js');
		}
	});
}

function showLogin() {
	$.get('components/login/login.html', function(data){ 
		$('#users').html(data);

		if(typeof window.loginjs == 'undefined') {
			$.getScript('components/login/login.js');
		}
	});
}

function showRegister() {
	$.get('components/register/register.html', function(data){ 
		$('#users').html(data);

		if(typeof window.registerjs == 'undefined') {
			$.getScript('components/register/register.js');
		}
	});
}

function showPinning() {
	$.get('components/pinning/pinning.html', function(data){ 
		$('#home').append(data);

		if(typeof window.pinningjs == 'undefined') {
			$.getScript('components/pinning/pinning.js');
		}
	});
}

function showProfile() {
	$.get('components/profile/profile.html', function(data){ 
		$('body').append(data);

		$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
			$('#form_profile #account_id').val(data.account.id);
			$('#form_profile #firstname').val(data.account.firstname);
			$('#form_profile #lastname').val(data.account.lastname);
			$('#form_profile #username').val(data.account.username);
			$('#form_profile #password').val(data.account.password);
			$('#form_profile #confirm_password').val(data.account.password);
			M.updateTextFields();
		});

		if(typeof window.profilejs == 'undefined') {
			$.getScript('components/profile/profile.js');
		}
	});
}

function showAddAccount() {
	$.get('components/add_account/add_account.html', function(data){ 
		$('body').append(data);

		if(typeof window.add_accountjs == 'undefined') {
			$.getScript('components/add_account/add_account.js');
		}
	});
}

function showEditAccount() {
	$.get('components/edit_account/edit_account.html', function(data){ 
		$('body').append(data);

		if(typeof window.edit_accountjs == 'undefined') {
			$.getScript('components/edit_account/edit_account.js');
		}
	});
}

function showEvacuations() {
	$.get('components/evacuations/evacuations.html', function(data){ 
		$('body').append(data);

		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/get_evacuations.php",
			data: true,
			success: function(result) {
				console.log(result);
				if(result) {
					result = JSON.parse(result);
					for(var i=0;i<result.length;i++) {
						$('#evacuations_panel table>tbody').append('<tr id="evacuation'+result[i].id+'">'
							+ '<td>' + result[i].evacuation_name + '</td>'
							+ '<td><button id="'+result[i].id+'" class="delete_evacuation btn red waves-effect waves-light"><i class="material-icons">delete</i></button></td>'
							+ '</tr>');
					}
				}
				else {
					$('#evacuations_panel table>tbody').append('<tr><td colspan="2">No Record Found!</td></tr>');
				}
			},
			error: function(result) {
				console.log(result);
			}
		});

		if(typeof window.evacuationsjs == 'undefined') {
			$.getScript('components/evacuations/evacuations.js');
		}
	});
}

function showAddEvacuation() {
	$.get('components/add_evacuation/add_evacuation.html', function(data){ 
		$('body').append(data);

		if(typeof window.add_evacuationjs == 'undefined') {
			$.getScript('components/add_evacuation/add_evacuation.js');
		}
	});
}

function goToGuest() {
	showNavbar();
	showTabsGuest();
	showContentsGuest();
	showSearch();
	showMap();
	showLogin();
}

function goToRegisteredUser() {
	showNavbar();
	showTabsRegistered();
	showContentsRegistered();
	showSearch();
	showMap();
	showPinning();
	showProfile();
	isLoggedOn = true;
}

function goToAdmin() {
	showNavbar();
	showTabsAdmin();
	showContentsAdmin();
	showSearch();
	showMap();
	showPinning();
	showAddAccount();
	showEditAccount();
	showEvacuations();
	showAddEvacuation();
	isLoggedOn = true;
}

function goToOfficer() {
	showNavbar();
	showTabsOfficer();
	showContentsOfficer();
	showSearch();
	showMap();
	showPinning();
	showProfile();
	isLoggedOn = true;
}

function calculateAndGetRoutes(from, to, callback) {
	var directionsService = new google.maps.DirectionsService;
	directionsService.route({
		origin: from,
		destination: to,
		travelMode: 'DRIVING',
		provideRouteAlternatives: true
	}, function(response, status) {
		if (status === 'OK') {
			callback(response.routes);
		} else {
			alert('Directions request failed due to ' + status);
		}
	});
}

function calculateDistanceMatrix(origin, destination, callback) {
	var service = new google.maps.DistanceMatrixService;

	service.getDistanceMatrix({
		origins: [origin],
		destinations: [destination],
		travelMode: 'DRIVING',
		unitSystem: google.maps.UnitSystem.METRIC
	}, function(response, status) {
		if (status !== 'OK') {
			alert('Error was: ' + status);
		} else {
			var results = response.rows[0].elements;
			callback(results[0].distance.text, results[0].duration.text);
		}
	});
}

function decode(encoded, callback) {
	var points = [];
	var index = 0, len = encoded.length;
	var lat = 0, lng = 0;
	while (index < len) {
		var b, shift = 0, result = 0;
		do {
			b = encoded.charAt(index++).charCodeAt(0) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);

		var dlat = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
		lat += dlat;
		shift = 0;
		result = 0;
		do {
			b = encoded.charAt(index++).charCodeAt(0) - 63;
			result |= (b & 0x1f) << shift;
			shift += 5;
		} while (b >= 0x20);
		var dlng = ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
		lng += dlng;

		points.push({"lat":( lat / 1E5), "lng":( lng / 1E5)});  
	}
	callback(points);
}

function searchDestination(destination) {
	var option = {
		enableHighAccuracy: true
	};

	if(destinationPolyLine) {	
		destinationPolyLine.remove();
		routePoints[0].remove();
		routePoints[1].remove();
	}

	plugin.google.maps.LocationService.getMyLocation(option, function(location){
		var currentLocation = {lat: location.latLng.lat, lng: location.latLng.lng};
		// var currentLocation = {lat: 17.6029987, lng: 121.76294440000001};
		calculateAndGetRoutes(currentLocation, destination, function(routes){
			var roadblocks = [];
			var blocked_routes = [];
			var routes_array = [];
			for(var i=0;i<activePolyLines.length;i++) {
				var color = activePolyLines[i].get('color');
				var r = color[0];
				var g = color[1];
				var b = color[2];
				switch(rgb2hex(r, g, b)) {
					case '#f44336':
					case '#795548':
					case '#ff5722':
					case '#9e9e9e':
					roadblocks.push(i);
					break;
				}
			}

			for(var i=0;i<routes.length;i++) {
				routes_array.push(i);
				var routePolyLine = new google.maps.Polyline({
					path: routes[i].overview_path
				});

				route:
				for(var j=0;j<roadblocks.length;j++){
					for(var k=0;k<activePolyLines[roadblocks[j]].getPoints().getLength();k++) {
						if(google.maps.geometry.poly.isLocationOnEdge(new google.maps.LatLng(activePolyLines[roadblocks[j]].getPoints().getAt(k).lat, activePolyLines[roadblocks[j]].getPoints().getAt(k).lng), routePolyLine))
						{
							blocked_routes.push(i);
							break route;
						}
					}
				}
			}

			var saferoutes = routes_array.filter(function(val) {
				return blocked_routes.indexOf(val) == -1;
			});

			var route_path = null;
			if(saferoutes.length) {
				route_path = routes[saferoutes[0]].overview_polyline;
			}
			else {
				route_path = routes[0].overview_polyline;
			}

			decode(route_path, function(decodedPolyLine){
				console.log(decodedPolyLine);
				destinationPolyLine = map.addPolyline({
					'points': decodedPolyLine,
					'color' : '#2196f3',
					'width': 10,
					'geodesic': true
				});

				calculateDistanceMatrix(currentLocation, destination, function(distance, duration){
					routePoints[0] = map.addMarker({
						position: decodedPolyLine[0],
						title: "You are here!",
						icon: 'blue'
					});
					routePoints[1] = map.addMarker({
						position: decodedPolyLine[decodedPolyLine.length - 1],
						title: destination + "\nDistance: " + distance + "\nDuration: " + duration,
						icon: 'blue'
					});
					routePoints[0].showInfoWindow();
					routePoints[1].showInfoWindow();
					map.animateCamera({
						target : decodedPolyLine
					});
				});
			});
		});
	}, 
	function(msg){
		console.log(JSON.stringify(msg));
	});
}

function getLatLng(address, callback) {
	var geocoder = new google.maps.Geocoder;
	geocoder.geocode({'address': address}, function(results, status) {
		if (status === 'OK') {
			callback(results[0].geometry.location);
		} else {
			alert(address + "'s geocode was not successful for the following reason: " + status);
		}
	});
}

function getPlaceName(latlng, index, callback) {
	var geocoder = new google.maps.Geocoder;
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === 'OK') {
			if (results[0]) {
				callback(results[0].formatted_address, index);
			} 
			else {
				window.alert('No results found');
			}
		} 
		else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}

function getPolyLinePaths(polyline, color, index, callback) {
	var directionsService = new google.maps.DirectionsService();
	var paths = [];
	directionsService.route({
		origin: polyline[0],
		destination: polyline[polyline.length - 1],
		travelMode: google.maps.TravelMode.DRIVING
	}, function (result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			var legs = result.routes[0].legs;
			for (i = 0; i < legs.length; i++) {
				var steps = legs[i].steps;
				for (j = 0; j < steps.length; j++) {
					var nextSegment = steps[j].path;
					for (k = 0; k < nextSegment.length; k++) {
						paths.push(nextSegment[k].toJSON());
					}
				}
			}

			activePolyLines[index] = map.addPolyline({
				'idx' : index,
				'points': paths,
				'color': color,
				'visible' : false
			});

			callback(index);
		}
		else {
			console.log(status);
		}
	});
}

function showAllPolyLines() {
	checkTrafficStatusTime();
	if(activePolyLines.length > 0) {
		for(var i=0;i<activePolyLines.length;i++) {
			activePolyLines[i].remove();
		}
		activePolyLines = [];
	}

	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/get_traffic_status.php",
		data: true,
		success: function(result) {
			console.log(result);
			if(result) {
				result = JSON.parse(result);
				var totalItems = result.length;
				var chunks = [];
				var loopCount = 0;
				while (result.length > 0) {
					chunks.push(result.splice(0, 10));
				}
				(function loop(iteration) {
					setTimeout(function() {
						for(var i=0;i<chunks[loopCount].length;i++) {
							getPolyLinePaths(JSON.parse(chunks[loopCount][i].polyline), chunks[loopCount][i].pincolor, (loopCount * 10) + i, function(index){
								if(index == totalItems - 1) {
									var common_points = [];
									for (var a = 0; a < activePolyLines.length; a++) {
										for (var b = a + 1; b < activePolyLines.length; b++) {
											loop:
											for (var x = 0; x < activePolyLines[a].getPoints().getLength(); x++) {
												for (var y = 0; y < activePolyLines[b].getPoints().getLength(); y++) {
													if(google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(activePolyLines[a].getPoints().getAt(x).lat, activePolyLines[a].getPoints().getAt(x).lng), new google.maps.LatLng(activePolyLines[b].getPoints().getAt(y).lat, activePolyLines[b].getPoints().getAt(y).lng)) < 0.1) {
														common_points.push({
															"polylineA" : {
																"id" : a,
																"color" : activePolyLines[a].get('color')
															},
															"polylineB" : {
																"id" : b,
																"color" : activePolyLines[b].get('color')
															}
														});
														console.log(a + "_" + b);
														break loop;
													}
												}
											}
										}
									}
									if(common_points.length) {
										var match = [];
										match.push([common_points[0].polylineA.id, common_points[0].polylineB.id]);
										for(var o = 1;o < common_points.length;o++) {
											var hasMatch = false;
											var first = common_points[o].polylineA.id;
											var second = common_points[o].polylineB.id;
											for(var p = 0; p < match.length;p++) {
												if($.inArray(first, match[p]) !== -1 || $.inArray(second, match[p]) !== -1) {
													match[p].push(first);
													match[p].push(second);
													hasMatch = true;
												}
											}

											if(!hasMatch) {
												match.push([first, second]);
											}
										}

										removeDuplicates(match, function(groups){
											var colors = [];
											var polylineIds = [];
											var longestPathIndex = 0;
											var longestPathIndexes = [];
											for(var n=0;n<groups.length;n++) {
												if(groups[n].length >= 5) {
													var longestPath = activePolyLines[groups[n][0]].getPoints().getLength();
													colors.push([]);
													polylineIds.push([]);
													for(var c=0;c<groups[n].length;c++) {
														var polylineColor = activePolyLines[groups[n][c]].get('color');
														var r = polylineColor[0];
														var g = polylineColor[1];
														var b = polylineColor[2];
														colors[colors.length - 1].push(rgb2hex(r, g, b));

														if(longestPath < activePolyLines[groups[n][c]].getPoints().getLength()) {
															longestPath = activePolyLines[groups[n][c]].getPoints().getLength();
															longestPathIndex = groups[n][c];
														}

														polylineIds[polylineIds.length - 1].push(activePolyLines[groups[n][c]].get('idx'));
													}
													longestPathIndexes.push(longestPathIndex);
												}
											}

											if(colors.length) {
												var isMatch = true;
												var new_polyline = null;
												for(var d=0;d<colors.length;d++) {
													for(var e=0;e<colors[d].length - 1;e++) {
														if(colors[d][e] !== colors[d][e+1]) {
															isMatch = false;
														}
													}

													if(isMatch) {
														new_polyline = map.addPolyline({
															'points': activePolyLines[longestPathIndexes[d]].getPoints(),
															'color': colors[d][0],
															'visible': false
														});
													}
													else {
														new_polyline = map.addPolyline({
															'points': activePolyLines[longestPathIndexes[d]].getPoints(),
															'color': '#F44336',
															'visible': false
														});
													}

													activePolyLines.push(new_polyline);
												}

												for(var v=0;v<polylineIds.length;v++) {
													for(var w=0;w<polylineIds[v].length;w++) {
														var id = polylineIds[v][w];
														$.each(activePolyLines, function(key, value) { 
															if(value.get('idx') == id) {
																activePolyLines.splice(key, 1);
																return false; 
															}
														});
													}
												}
											}
										});
									}

									for(var i=0;i<activePolyLines.length;i++) {
										var red = activePolyLines[i].get('color')[0];
										var green = activePolyLines[i].get('color')[1];
										var blue = activePolyLines[i].get('color')[2];
										map.addPolyline({
											'points': activePolyLines[i].getPoints(),
											'color': rgb2hex(red, green, blue),
											'width': 10,
											'geodesic': true
										});
									}
								}
							});
}

if (--iteration) {          
	loop(iteration);
}
loopCount++;
}, 2500);
})(chunks.length);

}
else {
	M.toast({html: "No Traffic Status Found!"});
}
},
error: function(result) {
	console.log(result);
}
});
}

function showUsersPolyLines() {
	checkTrafficStatusTime();
	if(activePolyLines.length > 0) {
		for(var i=0;i<activePolyLines.length;i++) {
			activePolyLines[i].remove();
		}
		activePolyLines = [];
	}

	$.getJSON(cordova.file.externalDataDirectory + 'config.json', function(data){
		var id = data.account.id;
		$.ajax({
			type: "POST",
			url: "http://holotomyar.com/mobile_requests/road2go/get_user_traffic_status.php",
			data: {"id" : id},
			success: function(result) {
				console.log(result);
				if(result) {
					result = JSON.parse(result);
					for(var i=0;i<result.length;i++) {
						activePolyLines[i] = map.addPolyline({
							'idx' : result[i].id,
							'points': JSON.parse(result[i].polyline),
							'color': result[i].pincolor,
							'width': 10,
							'geodesic': true,
							'clickable': true
						}, function(polyline) {
							polyline.on(plugin.google.maps.event.POLYLINE_CLICK, function() {
								console.log(this.get('idx'));
								var a = this.get('color')[0];
								var b = this.get('color')[1];
								var c = this.get('color')[2];
								$('.unpin_button').css('background-color', 'rgb('+a+','+b+','+c+')');
								$('.unpin_button').attr('id', this.get('idx'));
								$('.unpin-panel').removeClass('hide');
							});
						});
					}
				}
				else {
					M.toast({html: "No Traffic Status Found!"});
				}
			},
			error: function(result) {
				console.log(result);
			}
		});
	});
}

function showAdminPolyLines() {
	checkTrafficStatusTime();
	if(activePolyLines.length > 0) {
		for(var i=0;i<activePolyLines.length;i++) {
			activePolyLines[i].remove();
		}
		activePolyLines = [];
	}

	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/get_admin_traffic_status.php",
		data: true,
		success: function(result) {
			console.log(result);
			if(result) {
				result = JSON.parse(result);
				for(var i=0;i<result.length;i++) {
					activePolyLines[i] = map.addPolyline({
						'idx' : result[i].id,
						'points': JSON.parse(result[i].polyline),
						'color': result[i].pincolor,
						'width': 10,
						'geodesic': true,
						'clickable': true
					}, function(polyline) {
						polyline.on(plugin.google.maps.event.POLYLINE_CLICK, function() {
							console.log(this.get('idx'));
							var a = this.get('color')[0];
							var b = this.get('color')[1];
							var c = this.get('color')[2];
							$('.unpin_button').css('background-color', 'rgb('+a+','+b+','+c+')');
							$('.unpin_button').attr('id', this.get('idx'));
							$('.unpin-panel').removeClass('hide');
						});
					});
				}
			}
			else {
				M.toast({html: "No Traffic Status Found!"});
			}
		},
		error: function(result) {
			console.log(result);
		}
	});
}

function rgb2hex(red, green, blue) {
	var rgb = blue | (green << 8) | (red << 16);
	return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

function removeDuplicates(array, callback) {
	var result = [];

	for(var i=0;i<array.length;i++) {
		var new_array = array[i].filter(function(elem, index, self) {
			return index === self.indexOf(elem);
		});
		result.push(new_array);
	}
	callback(result);
}

function checkTrafficStatusTime() {
	$.ajax({
		type: "POST",
		url: "http://holotomyar.com/mobile_requests/road2go/check_traffic_status_time.php",
		data: true,
		success: function(result) {
			console.log(result);
			if(result) {
				console.log(result);
			}
			else {
				M.toast({html: "Something Went Wrong! Try Again."});
			}
		},
		error: function(result) {
			console.log(result);
		}
	});
}