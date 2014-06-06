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

module.exports.vehicleUpdate = vehicleUpdate;
