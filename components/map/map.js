var mapjs = true;
var lastValidCenter = map.getCameraTarget();
var polyLineJSON = { "points" : [] };
var circlesArray = [];
var isPinningEnabled = false;

map.on(plugin.google.maps.event.MAP_CLICK, function(latLng) {
	console.log(latLng);

	if(isPinningEnabled && isLoggedOn) {
		circlesArray[Object.keys(polyLineJSON.points).length] = map.addCircle({
			'center': latLng,
			'radius': 2,
			'strokeWidth': 1,
			'fillColor': '#F36077',
			'strokeColor': '#EE1133'
		});

		polyLineJSON.points.push({
			"lat" : latLng.lat,
			"lng" : latLng.lng
		});
	}
});

map.on(plugin.google.maps.event.CAMERA_MOVE, function(){
	if (latLngBounds.contains(map.getCameraTarget())) {
		lastValidCenter = map.getCameraTarget();
		return; 
	}

	map.setCameraTarget(lastValidCenter);
});