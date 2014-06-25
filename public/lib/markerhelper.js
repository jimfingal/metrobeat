define(['leaflet', 'underscore', 'lib/routecolors', 'lib/routes'],
       function(L, _, Colors, Routes) {

    var vehicle_cache = {};

    var getLatLng = function(lat, lon) {
      return L.latLng(lat, lon);
    };

    var popupText = function(vehicle_id, route_id) {
      var result = "<b>Vehicle " + vehicle_id + "</b><br/>";

      var route_data = Routes.getRoute(route_id);

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

    var initializeVehicle = function(vehicle_id, route_id, lat, lon, map) {
      var marker = getMarker(
                        getLatLng(lat, lon),
                        Colors.getRouteColor(route_id));
      vehicle_cache[vehicle_id] = marker;
      marker.bindPopup(popupText(vehicle_id, route_id));
      map.addLayer(marker);
    };

    var moveVehicle = function(vehicle_id, lat, lon, map) {
      var marker = vehicle_cache[vehicle_id];
      marker.setLatLng(getLatLng(lat, lon));

      if (!map.hasLayer(marker)) {
        map.addLayer(marker);
      }
    };



    var MarkerHelper = function(map) {

      this.updateVehicle = function(vehicle_id, route_id, lat, lon) {
        if (_.has(vehicle_cache, vehicle_id)) {
          moveVehicle(vehicle_id, lat, lon, map);
        } else {
          initializeVehicle(vehicle_id, route_id, lat, lon, map);
        }
      };

      this.removeAllMarkers = function() {
        _.each(_.values(vehicle_cache), function(marker) {
            map.removeLayer(marker);
        });
      };

      this.removeMarker = function(vehicle_id) {
        var marker = vehicle_cache[vehicle_id];
        if (marker) {
          map.removeLayer(marker);
        }
      }
    };


    return MarkerHelper;


});
