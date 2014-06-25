define(['jquery', 'underscore', 'lib/routes', 'moment', 'lib/routecolors'],
 function($, _, Routes, moment, Colors) {

    var start_time;
    var end_time;
    var speed_multiplier = 60;

    var animation_start_ts;

    var requestID;

    var playing = false;

    var Replay;

    var current_frame = {};
    var last;
    var start = null;

    var vehicle_cache = {};

    var map;

    var vehicleLatLng = function(vehicle_moment) {
      return L.latLng(vehicle_moment['g'][1], vehicle_moment['g'][0]);
    };

    var popupText = function(vehicle) {
      var result = "<b>Vehicle " + vehicle["id"] + "</b><br/>";

      var route_data = Routes.getRoute(vehicle["route_id"]);

      if (route_data) {
        result = result + "Route: " + route_data;
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

    var initializeVehicle = function(id, vehicle_moment) {
      var marker = getMarker(
                        vehicleLatLng(vehicle_moment),
                        Colors.getRouteColor(vehicle_moment['r']));
      vehicle_cache[id] = marker;
      marker.bindPopup(popupText(vehicle_moment));
      //marker.addTo(map);
      map.addLayer(marker);
    };

    var moveVehicle = function(id, vehicle_moment) {
      var marker = vehicle_cache[id];
      marker.setLatLng(vehicleLatLng(vehicle_moment));
    };

    var updateVehicle = function(id, vehicle_moment) {
        if (_.has(vehicle_cache, id)) {
          moveVehicle(id, vehicle_moment);
        } else {
          initializeVehicle(id, vehicle_moment);
        }
    }

    var mapToAnimationTime = function(diff) {
        return start_time + diff;
    };

    var initializeAnimation = function(Rply, start, end) {
        start_time = start;
        end_time = end;
        Replay = Rply;
    };


    function step(timestamp) {

      if (playing) {

          var progress;
          if (start === null) {
            start = timestamp;
          }
          progress = (timestamp - start) * speed_multiplier;

          var animation_time = mapToAnimationTime(progress);

          $("#time").text(moment.utc(animation_time).format('MMMM Do YYYY, h:mm:ss a'));

          _.each(_.pairs(current_frame), function(pair) {

            var vehicle = pair[0];
            var frame_num = pair[1];

            var data = Replay.getVehicleData(vehicle);

            if (data && data[frame_num]) {
                var next_moment = data[frame_num];
                //console.log(next_moment)
                if (next_moment['t'] < animation_time) {
                    updateVehicle(vehicle, next_moment);
                    current_frame[vehicle] = frame_num + 1;
                }
            }
          });

          //console.log(accumulated);
          last = timestamp;
          window.requestAnimationFrame(step);
      }
    };

    var initializeVehicles = function() {
        _.each(Replay.vehicles(), function(vehicle_id) {
            current_frame[vehicle_id] = 0;
        });

        console.log(current_frame);
    };

    var startAnimation = function(map) {
        if (!playing) {
            animation_start_ts = Date.now();
            last = animation_start_ts;
            start = null;
            requestID = window.requestAnimationFrame(step);
            playing = true;
            initializeVehicles(map);
        }
    };

    var stopAnimation = function() {
        if (playing) {
            window.cancelAnimationFrame(requestID);
            playing = false;
        }
    };

    var Animation = {};

    Animation.initializeAnimation = initializeAnimation;
    Animation.startAnimation = startAnimation;
    Animation.stopAnimation = stopAnimation;

    return Animation;

});
