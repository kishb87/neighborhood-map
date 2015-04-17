

/* Initialize Geocomplete */

$(document).ready(function(){


	var hello = $("input").val();
	console.log(hello);
});





/* Knockout Model */

function AppViewModel() {
	var self = this;

	self.city = ko.observable("San Francisco, CA, United States");


}

  
ko.applyBindings(new AppViewModel());


/* google maps -----------------------------------------------------*/

function initialize() {

  /* position Amsterdam */
  var latlng = new google.maps.LatLng(52.3731, 4.8922);

  var mapOptions = {
    center: latlng,
    scrollWheel: false,
    zoom: 13
  };
  
  var marker = new google.maps.Marker({
    position: latlng,
    url: '/',
    animation: google.maps.Animation.DROP
  });

  
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  marker.setMap(map);


};



google.maps.event.addDomListener(window, 'load', initialize);




/* end google maps -----------------------------------------------------*/