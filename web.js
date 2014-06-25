var express = require('express'),
http = require('http'),
path = require('path'),
request = require('request'),
flow = require("asyncflow"),
_ = require('underscore'),
io = require('socket.io');

var compression = require('compression');


var mongohelper = require('./lib/mongohelper');
var geohelper = require('./lib/geohelper');
var config = require('./lib/config');
var metroapi = require('./lib/metroapi');

if (process.env.NEW_RELIC_APP_NAME) {
  require('newrelic');
}

var app = express();

app.set('port', config.web.PORT);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.use(compression());
app.use(express.static(path.join(__dirname, '/public')));

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

app.get('/moments/:start/:end', function(req, res) {
  
  console.log(req.params);

  var cursor = mongohelper.aggregateCursor(
     'moments',
     [
       { $match: { 'snapshot_ts' : { $gt: parseInt(req.params.start), $lt: parseInt(req.params.end) }} }, 
       { $sort: {'snapshot_ts': 1}},
       { $project: {'v': "$id", 'r': "$route_id", 'g': "$geo", 't' : "$snapshot_ts", '_id': 0}}
     ], 
     {'allowDiskUse': true, 
     cursor: { batchSize: 1000 }
   });

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  var first = true;
  res.write('[');
  cursor.on('data', function(data) {
    if (first) {
      first = false;
    } else {
      res.write(',');
    }
    res.write(JSON.stringify(data));
  });

  cursor.on('end', function() {
    res.write(']');
    res.end();
  });

  /*
  cursor.get(function(err, results) {
    if (err !== null) {
      console.log("Err: " + err);
    }
    console.log(results.length);
    res.end(JSON.stringify(results));
  });
  */

});


var server = http.createServer(app);
var serverio = io.listen(server);


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
      vehicle['geo'] = [vehicle['longitude'], vehicle['latitude']];

      // If false, must be '' as process.env coerces to string
      if (process.env.STORE_METRO_DATA) {
        mongohelper.insertDocument(config.mongo.UPDATE_COLLECTION, vehicle);
      }
      serverio.to('realtime').emit('vehicle_update', vehicle);
      //console.log("Vehicle is updated: " + vehicle['id']);
    }
  };

  metroapi.vehicleUpdate(vehicleCallback);
};



var initDb = flow.wrap(mongohelper.initDb);

flow(function() {

  console.log("Initializing DB");
  var done = initDb().wait();

  server.listen(app.get('port'));
  console.log('listening on port ' + app.get('port'));

  updateVehicles();
  setInterval(updateVehicles, INTERVAL * 1000);

  serverio.sockets.on('connection', function(socket) {

    socket.on('refresh_cache', function() {
      console.log("Got request to refresh cache");
      _.each(_.values(update_tracker), function(vehicle) {
        socket.emit('vehicle_update', vehicle);
      });
    });

    socket.on("joinroom", function(room) {
      socket.join(room);
      console.log("Socket: " + socket.id + " joining room. Now in: " + socket.rooms);
    });

    socket.on("leaveroom", function(room) {
      socket.leave(room);
      console.log("Socket: " + socket.id + " Leaving room. Now in: " + socket.rooms);
    });

    socket.on("leaveroom", function(room) {
      socket.leave(room);
      console.log("Socket: " + socket.id + " Leaving room. Now in: " + socket.rooms);
    });

    socket.on('get_moments', function(start, end) {

      console.log("Got request from " + socket.id + " for moments from " + start + " to " + end);

      var cursor = mongohelper.aggregateCursor(
         'moments',
         [
           { $match: { 'snapshot_ts' : { $gt: start, $lt: end }} },
           { $sort: {'snapshot_ts': 1}},
           { $project: {'v': "$id", 'r': "$route_id", 'g': "$geo", 't' : "$snapshot_ts", '_id': 0}}
         ],
         {
          'allowDiskUse': true,
          cursor: { batchSize: 1000 }
       });

      var counter = 0;

      var batch = [];
      var batch_size = 1000;

      cursor.on('data', function(data) {
        data.r = parseInt(data.r);
        batch.push(data);
        if (batch.length >= batch_size) {
          socket.emit('data', batch);
          batch.length = 0;
        }
        counter++;
      });

      cursor.on('end', function() {
        socket.emit('data', batch);
        socket.emit('done', true);
      });

    });

});

});



