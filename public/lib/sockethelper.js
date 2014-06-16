define(['socket.io'], function(io) {

    var helper = {};

    helper.getSocket = function() {

        var loc = window.location;
        var url = location.protocol + '//' + location.hostname + ':' + location.port;
        var socket = io.connect(url);

        socket.on('disconnect', function() {
         console.log('Socket disconnected.');
        });

        socket.on('connect', function() {
         console.log('Socket connected.');
         console.log(socket);
        });

        return socket;
    };

    return helper;

});
