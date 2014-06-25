define(['jquery', 'leaflet', 'underscore', 'lib/routecolors', 'lib/routes'],
       function($, L, _, Colors, Routes) {


    var init = function(socket, marker_helper) {

        socket.emit('joinroom', 'realtime');
        socket.emit("refresh_cache");

        socket.on("vehicle_update", function(vehicle_moment) {
            marker_helper.updateVehicle(vehicle_moment['id'], 
                                        vehicle_moment['route_id'], 
                                        vehicle_moment['latitude'], 
                                        vehicle_moment['longitude']);
        });

    };

    var stop = function(socket, marker_helper) {
        socket.emit('leaveroom', 'realtime');
        marker_helper.removeAllMarkers();
    };

    var start = function(socket) {
        socket.emit('joinroom', 'realtime');
        socket.emit('refresh_cache');
    };

    var Realtime = {};
    Realtime.init = init;
    Realtime.start = start;
    Realtime.stop = stop;

    return Realtime;


});
