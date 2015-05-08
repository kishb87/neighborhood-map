function AppViewModel() {
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

//Initialize google maps
    function initialize(markers) {

            var avg, mapOptions, map, data, markerLength, lngNew;
            avg = average(markers);
            markerLength = markers.length;
            lngNew = avg[1];

            if ($(window).width() > 767) {
               lngNew = lngNew - .09;
            }
            mapOptions = {
                center: {lat: avg[0], lng: lngNew},
                zoom: 12,
                panControl: true,
                panControlOptions: {
                  position: google.maps.ControlPosition.TOP_RIGHT
                },
                zoomControl: true,
                zoomControlOptions: {
                  style: google.maps.ZoomControlStyle.LARGE,
                  position: google.maps.ControlPosition.TOP_RIGHT
                }
            };

            map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);

            data = [];

            //Create markers for map
            function markerPopulate(){

                var content, infowindow, i = markerLength, marker;

                while ( i-- ){  
                        marker = new google.maps.Marker({
                        position: new google.maps.LatLng(markers[i][1], markers[i][2]),
                        map: map,
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
                                marker.setAnimation(google.maps.Animation.BOUNCE);
                                google.maps.event.addListener(map, "click", function(event) {
                                    infowindow.close();
                                    marker.setAnimation(null);
                                });
                            };
                        })(marker,content,infowindow));
                        data.push({marker: marker, infoWindow: infowindow});               
                    }
                return data;           
            }
           //Create info windows for when user clicks
            function printWindow(markers, results){
                var results, i = markerLength;

                while ( i-- ){
                    var id, elem, latlng, marker, content;

                    id = i;
                    elem = document.getElementById(id);
                    marker = results[i].marker;
                    content = results[i].infoWindow;
                    
                    elem.addEventListener('click', (function(marker, content){
                        return function(){
                                    var infowindow = content;
                                    infowindow.open(map, marker);
                                    marker.setAnimation(google.maps.Animation.BOUNCE);
                                    google.maps.event.addListener(map, "click", function(event) {
                                        marker.setAnimation(null);
                                        infowindow.close();
                                    });      
                                };
                    })(marker, content));
                } 
            }

        results = markerPopulate();
        printWindow(markers, results);
    }      
/* Yelp API Call -----------------------------------------------------*/
/* Note: This code is a modification from code received from this Google Group: 
https://groups.google.com/forum/#!topic/yelp-developer-support/5bDrWXWJsqY */    
    //Ajax call to Yelp API
    var yelpCall = (function(){
        var self, auth, message, request;

        self = this;
        //Load paramters for AJAX Call
        function parameterInput(city){
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
                };
                terms = 'tacos';
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
        }
        //Make AJAX Call
        request = function(city) {
                        $.ajax({
                        'url' : 'http://api.yelp.com/v2/search',
                        'data' : parameterInput(city),
                        'dataType' : 'jsonp',
                        'jsonpCallback' : 'cb',
                        error: function(xhr, status, error) {
                          var err = eval("(" + xhr.responseText + ")");
                          alert(err.Message);
                        },
                        'success' : function(data, textStats, XMLHttpRequest) {
                            restaurantCompile(data);
                        }
                        }); 
                    };
        return {request: request};

    })();
    //Format restaurant data
    function restaurantCompile(data){

        var markers = [];
        function nameCompile(){
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
            }  
        }
        //Format lat and long of restaurant
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
        }
        nameCompile();
        coordinateCompile();
        //Send coordinates to google maps
        google.maps.event.addDomListener(window, 'load', initialize(markers));
    }

    var self, city;

    self = this;

    self.restaurants = ko.observableArray();
    self.city = ko.observable();
    self.rating = ko.observableArray();
    city = self.city;
    self.select = function(){
        yelpCall.request(city);
    };

    yelpCall.request();

    return self;

}


var viewModel = AppViewModel();
ko.applyBindings(viewModel);
