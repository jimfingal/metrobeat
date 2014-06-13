var express = require('express'),
  http = require('http'),
  path = require('path'),
  request = require('request'),
  _ = require('underscore'),
  io = require('socket.io');

var mongohelper = require('./lib/mongohelper');
var geohelper = require('./lib/geohelper');
var config = require('./lib/config');
var metroapi = require('./lib/metroapi');

require('newrelic');

var app = express();

app.configure(function() {
  app.set('port', config.web.PORT);
  app.set('views', path.join(__dirname, '/views'));
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, '/public')));
});

app.get('/', function(req, res) {
  res.render('index', {
      title: "Metrobeat"
    });
});

app.get('/mapconfig', function(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(config.geo.mapconfig));
});

app.get('/routes', function(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(metroapi.route_cache));
});


var server = http.createServer(app);
var serverio = io.listen(server);


server.listen(app.get('port'));
console.log('listening on port ' + app.get('port'));


var INTERVAL = 10;

var update_tracker = {};

var isUpdated = function(vehicle) {

  if (! _.has(update_tracker, vehicle["id"])) {
    return true;
  }

  var cached = update_tracker[vehicle["id"]];
  if (cached['longitude'] !== vehicle['longitude'] ||
      cached['latitude'] !== vehicle['latitude']) {
    return true;
  }
  return false;

};

var updateVehicles = function() {
  var now = Date.now();
  console.log("refreshing vehicles: " + now);

  var vehicleCallback = function(vehicle) {

    if (isUpdated(vehicle)) {
      update_tracker[vehicle["id"]] = vehicle;
      vehicle['snapshot_ts'] = now;

      // If false, must be '' as process.env coerces to string
      if (process.env.STORE_METRO_DATA) {
        mongohelper.insertDocument(config.mongo.UPDATE_COLLECTION, vehicle);
      }
      serverio.emit('vehicle_update', vehicle);
      //console.log("Vehicle is updated: " + vehicle['id']);
    }
  };

  metroapi.vehicleUpdate(vehicleCallback);
};

updateVehicles();
setInterval(updateVehicles, INTERVAL * 1000);


serverio.sockets.on('connection', function(socket) {
  _.each(_.values(update_tracker), function(vehicle) {
    serverio.emit('vehicle_update', vehicle);
  });
});
