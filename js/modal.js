2014
mapboxgl.accessToken = 'pk.eyJ1IjoiZWxtNWJjIiwiYSI6ImNqNzB1OXFjZTAwam8zMW81b2hueGxhaXQifQ.pM2PCsAfsqXqlvm9jrql3Q';

var map = new mapboxgl.Map({
	container: 'map',
	minZoom: 10,
	maxZoom: 17,
	pitchWithRotate: false,
	style: 'mapbox://styles/elm5bc/cj8xtuzepciuc2rmiusvpnooq' 
});

// PARKS - INFO WINDOW CHANGES ON HOVER
// code to add interactivity once map loads
map.on('load', function() {	// the event listener that does some code after the map loads
	
	// the categories we created from the cville-parks map layer
	var layers = ['TREME - LAFITTE', 'FRENCH QUARTER'];
	
	// the colors we chose to style the parks on the map for each category
	var colors = ['#dae8ba', '#c9e392'];

	// add a legend to the map
	for (i = 0; i < layers.length; i++) {
	  var layer = layers[i];
	  var color = colors[i];
	  var item = document.createElement('div');
	  var key = document.createElement('span');
	  key.className = 'legend-key';
	  key.style.backgroundColor = color;

	  var value = document.createElement('span');
	  value.innerHTML = layer;
	  item.appendChild(key);
	  item.appendChild(value);
	  legend.appendChild(item);
	}

	// replace contents of info window when user hovers on a state
	map.on('mousemove', function(e) {	// event listener to do some code when the mouse moves
	  var neighborhoods = map.queryRenderedFeatures(e.point, {
	    layers: ['neighborhoods-i-10-9hxxs6']	// replace 'cville-parks' with the name of your layer, if using a different layer
	  });

	  if (neighborhoods.length > 0) {	// if statement to make sure the following code is only added to the info window if the mouse moves over a state
	    document.getElementById('pd').innerHTML = '<h3><strong>' + neighborhoods[0].properties.GNOCDC_LAB + '</strong></h3><p>' + neighborhoods[0].properties.Shape_Leng + ' PARK</p><p>URL: ' + neighborhoods[0].properties.WEBURL + '</p>';
	  } else {
	    document.getElementById('pd').innerHTML = '<p>Add Description.</p>';
	  }
	});


	// -----------------------------------------------------------------------
	// Interstate Highway - MODALS
	// code to add modals
    // event listener for clicks on map
    map.on('click', function(e) {
      var stops = map.queryRenderedFeatures(e.point, {
        layers: ['interstate-highway-point-a-57yh09'] // replace this with the name of the layer
      });

      // if the layer is empty, this if statement will return NULL, exiting the function (no popups created) -- this is a failsafe to avoid endless loops
      if (!stops.length) {
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
      popup.setHTML('<h3>Route: ' + stop.properties.Route  // 'stop_id' field of the dataset will become the title of the popup
                           + '</h3><p>' + stop.properties.Length // 'stop_name' field of the dataset will become the body of the popup
                           + '</p> <div class="popup-img" style="background: url(' + stop.properties.Filename + ');"></div>');

      // Add the popup to the map
      popup.addTo(map);  // replace "map" with the name of the variable in line 28, if different
    });

});
