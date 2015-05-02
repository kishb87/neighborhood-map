/* Google Maps -----------------------------------------------------*/
function average(markers){
    var latSum = 0, latAvg, avg, i = markers.length, longAvg, longSum = 0;
    
    while ( i-- ){
        latSum = latSum + markers[i][1];
        longSum = longSum + markers[i][2];
    }
    latAvg = latSum/markers.length;
    longAvg = longSum/markers.length;
    avg = [latAvg, longAvg];

    return avg;
}

function initialize(markers) {

        var avg, mapOptions, map, data, markerLength;
        avg = average(markers);
        markerLength = markers.length;

        mapOptions = {
          center: {lat: avg[0], lng: avg[1]},
          zoom: 12
        };


        map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);


        data = [];

        function markerPopulate(){

            var content, infowindow, i = markerLength;

            while ( i-- ){  
                    var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(markers[i][1], markers[i][2]),
                    map: map
                     });

                    marker.setAnimation(google.maps.Animation.DROP);



                    content = markers[i][0];


                    infowindow = new google.maps.InfoWindow({
                                              content: content
                                              });


                    google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
                     
                        return function() {
                           infowindow.setContent(content);
                           infowindow.open(map,marker);

                            google.maps.event.addListener(map, "click", function(event) {
                                infowindow.close();
                            });
                        };
                    })(marker,content,infowindow));


                    

                    data.push({marker: marker, infoWindow: infowindow}); 
          
                }
            return data;            
        };
       
        function printWindow(markers){
            var results, i = markerLength;
            console.log(markers);


            while ( i-- ){
                var id, elem, latlng, marker, content;
                id = i;
                elem = document.getElementById(id);
                latlng = new google.maps.LatLng(markers[i][1], markers[i][2]);

                marker = new google.maps.Marker({
                    position    : latlng,
                    map         : map
                });

                
                content = markers[i][0];
                
                elem.addEventListener('click', (function(marker, content){
                    return function(){
                                var infowindow = new google.maps.InfoWindow({
                                                  content: content
                                                  });
                                infowindow.close();
                                infowindow.open(map, marker); 
                                google.maps.event.addListener(map, "click", function(event) {
                                    infowindow.close();
                                });      
                            };
                })(marker, content));
            }

            // google.maps.event.addListener(map, "click", function(event) {
            //                                     infowindow.close();
            //                                 });
            
        }


        results = markerPopulate();
        printWindow(markers);
}





/* Yelp API Call -----------------------------------------------------*/

var yelpCall = (function(){
    var self, auth, message, request;

    self = this;
    
    function parameterMap(city){
        auth = {
                    //
                    // Update with your auth tokens.
                    //
                    consumerKey : "wu3iSseMZMhbIUVQOOxJBw",
                    consumerSecret : "KQ0c4Q3nGe_RaXb_ONn8vX5p3nI",
                    accessToken : "GUaqvCY2AUTQjHbS1JLTzA2cWJncjBMi",
                    // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
                    // You wouldn't actually want to expose your access token secret like this in a real application.
                    accessTokenSecret : "1BmHjlUVlADjBPg_Z1Xndc0IEx4",
                    serviceProvider : {
                        signatureMethod : "HMAC-SHA1"
                    }
            }, 
            terms = 'tacos',
            accessor = {
                consumerSecret : auth.consumerSecret,
                tokenSecret : auth.accessTokenSecret
            };
        
        city = (city)?city():"San Francisco, CA";
        parameters = [];
        parameters.push(['term', terms]);
        parameters.push(['location', city]);
        parameters.push(['callback', 'cb']);
        parameters.push(['oauth_consumer_key', auth.consumerKey]);
        parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
        parameters.push(['oauth_token', auth.accessToken]);
        parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

        message = {
            action : 'http://api.yelp.com/v2/search',
            method : 'GET',
            parameters : parameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, accessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        return parameterMap;
    };
    

    request = function(city) {
                    $.ajax({
                    'url' : 'http://api.yelp.com/v2/search',
                    'data' : parameterMap(city),
                    'dataType' : 'jsonp',
                    'jsonpCallback' : 'cb',
                    'success' : function(data, textStats, XMLHttpRequest) {
                        model(data);
                    }
                    }); 
                }
    return {request: request};

})();


function model(data){

    var markers = [];
    function restaurantCompile(){
        var i = data.businesses.length;
        viewModel.restaurants.removeAll();
        while ( i-- ) {
            viewModel.restaurants.push({"name": data.businesses[i].name, 
                                       "rating": data.businesses[i].rating + " Stars", 
                                       "imgurl": data.businesses[i].image_url,
                                       "address": data.businesses[i].location.address[0],
                                       "display_phone": data.businesses[i].display_phone,
                                       "coordinate": data.businesses[i].location.coordinate,
                                       "url": data.businesses[i].url});
        };   
    };
    function coordinateCompile(){
        var business, i = data.businesses.length;

        while ( i-- ) {
            business = data.businesses[i];
            if ( business.location && business.location.coordinate ) {
                markers.push([
                    business.name,
                    business.location.coordinate.latitude,
                    business.location.coordinate.longitude,
                ]);
            }
        }
    };
    restaurantCompile();
    coordinateCompile();
    google.maps.event.addDomListener(window, 'load', initialize(markers));
};


/* Knockout viewModel */

function AppViewModel() {
	var self, city;

    self = this;

	self.restaurants = ko.observableArray();
    
	self.city = ko.observable();
    self.rating = ko.observableArray();
    city = self.city;
	self.select = function(){
        yelpCall.request(city);
	}
    
    return self;
}


var viewModel = AppViewModel();
ko.applyBindings(viewModel);
yelpCall.request();
