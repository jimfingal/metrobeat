define(['jquery', 'leaflet', 'underscore', 'tinycolor', 'clusterfck',
          'esri-leaflet', 'jquery-ui', 'bootstrap'],
          function($, L, _, tinycolor, clusterfck) {

    var marker_layers = {};
    var cluster_layer = new L.LayerGroup();
    var layers_control = L.control.layers({}, marker_layers, {'position': 'bottomleft'});

    var tron_cyan = "#6FC3DF";
    var tron_orange = "#DF740C";
    var tron_yellow = "#FFE64D";

    var colors = [tron_cyan, tron_yellow, tron_orange];
    var vehicle_cache = {};
    var route_cache = {};
    var code_to_color = {};


    var getColor = function(route) {
      if (code_to_color[route]) {
        return code_to_color[route];
      } else {
        return "#6FC3DF";
      }
    };

    var refreshColors = function() {

      var routes = _.keys(route_cache);
      var total = routes.length;

      var i = 0;
      _.each(routes, function(route) {
          i++;
          var color = tinycolor("hsv " + ((i / total) * 360) + " 100 75").toHexString();
          code_to_color[route] = color;
      });

    };

    var vehicleLatLng = function(vehicle_moment) {
      return L.latLng(vehicle_moment['latitude'], vehicle_moment['longitude']);
    };

    var popupText = function(vehicle) {
      var result = "<b>Vehicle " + vehicle["id"] + "</b><br/>";
      if (_.has(route_cache, vehicle["route_id"])) {
        result = result + "Route: " + route_cache[vehicle["route_id"]];
      }
      return result;
    };

    var getMarker = function(latlng, hex) {
      //var marker = L.marker(tweet['latlng']);
      var marker = L.circleMarker(latlng, {
        radius: 4,
        color: "black",
        fillColor: hex,
        fillOpacity: 0.5
      });
      return marker;
    };

    var initializeVehicle = function(vehicle_moment, map) {
      var marker = getMarker(vehicleLatLng(vehicle_moment), getColor(vehicle_moment['route_id']));
      vehicle_cache[vehicle_moment['id']] = marker;
      marker.bindPopup(popupText(vehicle_moment));
      marker.addTo(map);
    };

    var moveVehicle = function(vehicle_moment) {
      var marker = vehicle_cache[vehicle_moment['id']];
      marker.setLatLng(vehicleLatLng(vehicle_moment));
    };


    var startReplayMode = function(socket) {
      socket.emit('leaveroom', 'realtime');

      console.log("Getting between 1402531200000 and 1402617599999");
      cacheDataBetweenTS(socket, 1402531200000, 1402617599999);

      /*
      setTimeout(function() {
          socket.emit('get_moments', 1402531200000, 1402531300000);
      }, 1000);
      */

    };

    var STEP = 10000000;

    var current_start;
    var current_end;
    var current_interim;
    var lastbatch = false;
    var total_steps;
    var current_step;
    var start_time;
    var end_time;

    var cache = {};

    var cacheDataBetweenTS = function(socket, start, end) {
      current_start = start;
      current_end = end;
      current_interim = current_start;
      lastbatch = false;

      total_steps = (current_end - current_start) / STEP;
      current_step = 0;
      start_time = new Date();

      console.log("Will make this many batches of requests: " + total_steps);

      getNextBatch(socket);
    };

    var getNextBatch = function(socket) {

      current_step++;
      current_interim = current_interim + STEP;

      if (current_interim >= current_end) {
        current_interim = current_end;
        lastbatch = true;
        end_time = new Date();
        console.log("Took: " + end_time.getTime() - start_time.getTime());
      }

      socket.emit("get_moments", current_start, current_interim);
      
      /*
      $.getJSON("/moments/" + current_start + "/" + current_interim, function(data) {
          storeData(data);
          console.log(getPercent());
          getNextBatch(socket);
      });
      */

    };

    var storeData = function(data) {
        //console.log('Got data: ' + data.length);
        _.each(data, function(moment) {
          if (! _.has(cache, moment.t)) {
            cache[moment.t] = [];
          }
          cache[moment.t].push(_.omit(moment, 't'));
        });
    };

    var getPercent = function() {
      var pc = (current_step / total_steps) * 100;
      return pc + "%";
    };

    var setupReplaySettings = function(socket) {

      socket.on('data', function(data) {
        storeData(data);
      });

      socket.on('done', function(data) {
        // console.log('My batch is done so I would buffer some more here');
        console.log(getPercent());
        if (!lastbatch) {
          getNextBatch(socket);
        }

        //console.log(cache);
      });

    };

    var startRealtimeMode = function(socket, map) {
      socket.emit('joinroom', 'realtime');
    };



    var initializeMap = function(socket) {

      setupReplaySettings(socket);

      $.ajax({url: "/routes"}).done(function(res) {
        route_cache = res;
        refreshColors();
      });

      $.ajax({url: "/mapconfig"}).done(function(mapconfig) {

        var point = [mapconfig['center']['latitude'], mapconfig['center']['longitude']];

        var map = L.map('map', {
          //'maxZoom': 15
        }).setView(point, mapconfig['zoom']);

        L.esri.basemapLayer("Gray").addTo(map);

        startRealtimeMode(socket, map);

        socket.on("vehicle_update", function(vehicle_moment) {
          var id = vehicle_moment['id'];
          if (_.has(vehicle_cache, id)) {
            moveVehicle(vehicle_moment);
          } else {
            initializeVehicle(vehicle_moment, map);
          }
        });

        $('#replay').click(function() {
          console.log('Replay selected');
          startReplayMode(socket, map);
        });

        $('#realtime').click(function() {
          console.log('Real-time selected');
          startRealtimeMode(socket, map);
        });

        //layers_control.addTo(map);
      });
    };

    return initializeMap;

});
