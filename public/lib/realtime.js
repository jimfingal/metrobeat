define(['jquery', 'leaflet', 'underscore', 'lib/routecolors', 'lib/routes'],
       function($, L, _, Colors, Routes) {

    var vehicle_cache = {};

    var vehicleLatLng = function(vehicle_moment) {
      return L.latLng(vehicle_moment['latitude'], vehicle_moment['longitude']);
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

    var initializeVehicle = function(vehicle_moment, map) {
      var marker = getMarker(
                        vehicleLatLng(vehicle_moment),
                        Colors.getRouteColor(vehicle_moment['route_id']));
      vehicle_cache[vehicle_moment['id']] = marker;
      marker.bindPopup(popupText(vehicle_moment));
      marker.addTo(map);
    };

    var moveVehicle = function(vehicle_moment) {
      var marker = vehicle_cache[vehicle_moment['id']];
      marker.setLatLng(vehicleLatLng(vehicle_moment));
    };


    var init = function(socket, map) {

        socket.emit("refresh_cache");
        
        socket.on("vehicle_update", function(vehicle_moment) {
            var id = vehicle_moment['id'];
            if (_.has(vehicle_cache, id)) {
              moveVehicle(vehicle_moment);
            } else {
              initializeVehicle(vehicle_moment, map);
            }
        });

    };

    var stop = function(socket) {
        socket.emit('leaveroom', 'realtime');
    };

    var start = function(socket) {
        socket.emit('joinroom', 'realtime');
    };

    var Realtime = {};
    Realtime.init = init;
    Realtime.start = start;
    Realtime.stop = stop;

    return Realtime;


});
