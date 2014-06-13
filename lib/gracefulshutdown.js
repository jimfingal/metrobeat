
var _ = require('underscore');
var config = require('./config');

var callbacks = [];
var shuttingdown = false;

var addShutdownCallback = function(callback) {
    callbacks.push(callback);
};

var gracefulShutdown = function() {

    if (shuttingdown) {
        console.log("Blergh, already shutting down. Not shutting down twice");
        return;
    }
    shuttingdown = true;
    console.log("Received kill signal, shutting down gracefully.");
    console.error("Closing after " + config.process.SHUTDOWN_WAIT + " seconds");

    _.each(callbacks, function(callback) {
        callback();
    });

    setTimeout(function() {
       console.error("Exiting");
       process.exit();
    }, config.process.SHUTDOWN_WAIT * 1000);

};


process.on('SIGINT', function() {
  console.log('Got SIGINT.');
  gracefulShutdown();
});

process.on('SIGTERM', function() {
  console.log('Got SIGTERM.');
  gracefulShutdown();
});


module.exports.addShutdownCallback = addShutdownCallback;
module.exports.gracefulShutdown = gracefulShutdown;
