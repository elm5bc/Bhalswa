// Calling methods with javascript libraries
// 
// Mapbox GL JS 	mapboxgl.METHOD
// Leaflet 			L.METHOD
// jQuery			jQuery.METHOD  or $('selector').METHOD
// d3				d3.METHOD


// Provide access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxtNWJjIiwiYSI6ImNqNzB1OXFjZTAwam8zMW81b2hueGxhaXQifQ.pM2PCsAfsqXqlvm9jrql3Q';  // replace with your own access token

// Link to a mapbox studio style
var map = new mapboxgl.Map({
	container: 'map',
	minZoom: 4,
	maxZoom: 17,
	style: 'mapbox://styles/elm5bc/cjakdxk8ibpel2snt9ekezv6i' 
});

// San Francisco
var origin = [77.167329, 28.749338];

// Washington DC
var destination = [77.2090, 28.6139];

// A simple line from origin to destination.
var route = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                origin,
                destination
            ]
        }
    }]
};

// A single point that animates along the route.
// Coordinates are initially set to origin.
var point = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": origin
        }
    }]
};

// Calculate the distance in kilometers between route start/end point.
var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

var arc = [];

// Draw an arc between the `origin` & `destination` of the two points
for (var i = 0; i < lineDistance; i++) {
    var segment = turf.along(route.features[0], i / 1000 * lineDistance, 'kilometers');
    arc.push(segment.geometry.coordinates);
}

// Update the route with calculated arc coordinates
route.features[0].geometry.coordinates = arc;

// Used to increment the value of the point measurement against the route.
var counter = 0;

map.on('load', function () {
    // Add a source and layer displaying a point which will be animated in a circle.
    map.addSource('route', {
        "type": "geojson",
        "data": route
    });

    map.addSource('point', {
        "type": "geojson",
        "data": point
    });

    map.addLayer({
        "id": "route",
        "source": "route",
        "type": "line",
        "paint": {
            "line-width": 2,
            "line-color": "#007cbf"
        }
    });

    map.addLayer({
        "id": "point",
        "source": "point",
        "type": "symbol",
        "layout": {
            "icon-image": "airport-15",
            "icon-rotate": 90
        }
    });

    function animate() {
        // Update point geometry to a new position based on counter denoting
        // the index to access the arc.
        point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter];

        // Update the source with this new data.
        map.getSource('point').setData(point);

        // Request the next frame of animation so long as destination has not
        // been reached.
        if (point.features[0].geometry.coordinates[0] !== destination[0]) {
            requestAnimationFrame(animate);
        }

        counter = counter + 1;
    }

    document.getElementById('replay').addEventListener('click', function() {
        // Set the coordinates of the original point back to origin
        point.features[0].geometry.coordinates = origin;

        // Update the source layer
        map.getSource('point').setData(point);

        // Reset the counter
        counter = 0;

        // Restart the animation.
        animate(counter);
    });

    // Start the animation.
    animate(counter);
});

// PARKS - INFO WINDOW CHANGES ON HOVER
// code to add interactivity once map loads
map.on('load', function() {	// the event listener that does some code after the map loads
	
	// the categories we created from the cville-parks map layer CREATE SHAPEFILE WITH LAKE BOUNDARY AND LANDFILL BOUNDARY AND GOLFCOURSE AND NEIGHBORHOODS//
	var layers = [
		'BHALSWA LAKE', 
		'BHALSWA GOLFCOURSE',
		'BHALSWA LANDFILL' 
	];
	
	// the colors we chose to style the parks on the map for each category
	var colors = [
		'#4e6270', 
		'#c9e392', 
	];


	// replace contents of info window when user hovers on a state
	map.on('mousemove', function(e) {	// event listener to do some code when the mouse moves

	  var neighborhoods = map.queryRenderedFeatures(e.point, {
	    layers: ['bhalswa-1h22dz']	// replace 'cville-parks' with the name of your layer, if using a different layer
	  });

	  if (neighborhoods.length > 0) {	// if statement to make sure the following code is only added to the info window if the mouse moves over a state
	    document.getElementById('info-window-body').innerHTML = '<h3><strong>' + neighborhoods[0].properties.name + '</strong></h3><p>' + neighborhoods[0].properties.Des + '"</p>';
	    document.getElementById('info-window-image').innerHTML = '<div class="info-window-img" style="background: url(\'img/' + neighborhoods[0].properties.Filename + '\');"></div>';
	  } else {
	    document.getElementById('info-window-image').innerHTML = '<div class="info-window-img" style="background: url(\'img/1.jpg\');"></div>';
	  }
	
	});


// --------------------------------------------------------------------
	// Interstate Highway - POPUPS
	// code to add popups
    // event listener for clicks on map
    map.on('mousemove', function(e) {
      var neighborhoods = map.queryRenderedFeatures(e.point, {
        layers: ['bhalswa-1h22dz'] // replace this with the name of the layer
      });

      // if the layer is empty, this if statement will return NULL, exiting the function (no popups created) -- this is a failsafe to avoid endless loops
      if (!neighborhoods.length) {
        return;
      }

      // Sets the current feature equal to the clicked-on feature using array notation, in which the first item in the array is selected using arrayName[0]. The event listener above ("var stops = map...") returns an array of clicked-on bus stops, and even though the array might only have one item, we need to isolate it by using array notation as follows below.
      var stop = stops[0];
      
      // Initiate the popup
      var popup = new mapboxgl.Popup({ 
        closeButton: true, // If true, a close button will appear in the top right corner of the popup. Default = true
        closeOnClick: true, // If true, the popup will automatically close if the user clicks anywhere on the map. Default = true
        anchor: 'bottom', // The popup's location relative to the feature. Options are 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left' and 'bottom-right'. If not set, the popup's location will be set dynamically to make sure it is always visible in the map container.
        offset: [0, -15] // A pixel offset from the centerpoint of the feature. Can be a single number, an [x,y] coordinate, or an object of [x,y] coordinates specifying an offset for each of the different anchor options (e.g. 'top' and 'bottom'). Negative numbers indicate left and up.
      });

      // Set the popup location based on each feature
      popup.setLngLat(stop.geometry.coordinates);

      // Set the contents of the popup window
      popup.setHTML('<h2>Route: ' + stop.properties.name  // 'stop_id' field of the dataset will become the title of the popup
                           + '</h2><h3>Length: ' + stop.properties.Des // 'stop_name' field of the dataset will become the body of the popup
                           + '</h3> <div class="popup-img" style="background: url(\'img/' + stop.properties.Filename + '\');"></div>');   // Erica, the "\'" in this line is called an escape character. For this code to work, it had to have single quotes, and just a regular single quote broke the string. So you use the "\" character before the "'" to output a regular single quotation without ending the string. 

      // Add the popup to the map
      popup.addTo(map);  // replace "map" with the name of the variable in line 28, if different
    });

});


// Show "About this Map" modal when clicking on button
$('#about').on('click', function() {

	$('#screen').fadeToggle();  // toggles visibility of background screen when clicked (shows if hidden, hides if visible)

	$('.modal').fadeToggle();  // toggles visibility of background screen when clicked (shows if hidden, hides if visible)	                        
	
});

// Close "About this Map" modal when close button in modal is clicked
$('.modal .close-button').on('click', function() {

	$('#screen').fadeToggle();  // toggles visibility of background screen when clicked (shows if hidden, hides if visible)

	$('.modal').fadeToggle();  // toggles visibility of background screen when clicked (shows if hidden, hides if visible)	                        
	
});


