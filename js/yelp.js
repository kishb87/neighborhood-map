            var auth = {
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

            var terms = 'tacos';
            var near = 'San+Francisco';

            var accessor = {
                consumerSecret : auth.consumerSecret,
                tokenSecret : auth.accessTokenSecret
            };
            parameters = [];
            parameters.push(['term', terms]);
            parameters.push(['location', near]);
            parameters.push(['callback', 'cb']);
            parameters.push(['oauth_consumer_key', auth.consumerKey]);
            parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
            parameters.push(['oauth_token', auth.accessToken]);
            parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

            var message = {
                'action' : 'http://api.yelp.com/v2/search',
                'method' : 'GET',
                'parameters' : parameters
            };

            OAuth.setTimestampAndNonce(message);
            OAuth.SignatureMethod.sign(message, accessor);

            var parameterMap = OAuth.getParameterMap(message.parameters);
            //console.log(parameterMap);

            
            function request() {
                $.ajax({
                'url' : message.action,
                'data' : parameterMap,
                'dataType' : 'jsonp',
                'jsonpCallback' : 'cb',
                'success' : function(data, textStats, XMLHttpRequest) {
                    //$("body").append(data);
                    doStuff(data);
                }
                }); 
            }

            function doStuff(data){

                restaurants = [];
                for (i=0; i < data.businesses.length; i++){

                    console.log(data.businesses[i].review_count);
                }
                
            }
            var result = request();        

