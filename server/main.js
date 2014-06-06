var express = require('express'),
  http = require('http'),
  path = require('path'),
  request = require('request'),
  _ = require('underscore'),
  io = require('socket.io');

var mongohelper = require('./mongohelper');
var geohelper = require('./geohelper');
var config = require('./config');
var metroapi = require('./metroapi');


var base_dir = path.join(__dirname, '/../app/');
console.log(base_dir);

var app = express();

app.configure(function() {
  app.set('port', config.web.PORT);
  app.set('views', path.join(base_dir + 'views'));
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(path.join(base_dir, 'public')));
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


var server = http.createServer(app);
var serverio = io.listen(server);

var cache = [];

serverio.sockets.on('connection', function(socket) {
  _.each(cache, function(vehicle) {
    serverio.emit('vehicle_update', vehicle);
  });
});

server.listen(app.get('port'));
console.log('listening on port ' + app.get('port'));




var updateVehicles = function() {
  var now = Date.now();
  console.log("refreshing vehicles: " + now);

  var vehicleCallback = function(vehicle) {
    vehicle['snapshot_ts'] = now;
    mongohelper.insertDocument(config.mongo.UPDATE_COLLECTION, vehicle);
    serverio.emit('vehicle_update', vehicle);
    cache.push(vehicle);
  };

  cache.length = 0;
  metroapi.vehicleUpdate(vehicleCallback);
};

updateVehicles();
setInterval(updateVehicles, 10 * 1000);




