var request = require('request');
var _ = require('underscore');
var config = require('./config');

var VEHICLE_URL = "http://api.metro.net/agencies/lametro/vehicles/";

var vehicle_options = {
    url: VEHICLE_URL,
    json: true
};

var vehicleUpdate = function(vehicleCallback) {
    request(vehicle_options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var vehicles = body['items'];
            _.each(vehicles, vehicleCallback);
        }
    });
};

var route_cache = {};

request({
        url: "http://api.metro.net/agencies/lametro/routes/",
        json: true
    }, function(error, response, body) {

    _.each(body['items'], function(route) {
        route_cache[route['id']] = route['display_name'];
        //console.log(route);
    });
    
    //console.log(route_cache);
 
});

module.exports.vehicleUpdate = vehicleUpdate;
module.exports.route_cache = route_cache;
