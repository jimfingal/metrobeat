define(['jquery', 'underscore', 'lib/replayanimation'], function($, _, Animation) {

    var STEP = 10000000;

    var current_start;
    var current_end;
    var current_interim;
    var lastbatch = false;
    var total_steps;
    var current_step;
    var start_time;
    var end_time;

    var documents = 0;

    var moments = {};
    var vehicles = {};

    var cacheDataBetweenTS = function(socket, start, end) {
      current_start = start;
      current_end = end;
      current_interim = current_start;
      lastbatch = false;

      total_steps = (current_end - current_start) / STEP;
      current_step = 0;
      start_time = Date.now();

      console.log("Will make this many batches of requests: " + total_steps);

      getNextBatch(socket);
    };

    var getNextBatch = function(socket) {

      current_step++;
      current_interim = current_interim + STEP;

      if (current_interim >= current_end) {
        current_interim = current_end;
        lastbatch = true;
        console.log("Took: " + (Date.now() - start_time.getTime));
        console.log(vehicles);
        console.log(moments);
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
          if (! _.has(moments, moment.t)) {
            moments[moment.t] = true;
          }
          if (! _.has(vehicles, moment.v)) {
            vehicles[moment.v] = [];
          }
          vehicles[moment.v].push(_.omit(moment, 'v'));
          documents++;
          //$('#documents').text(documents);
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
        console.log(getPercent());
        if (!lastbatch) {
          getNextBatch(socket);
        }
      });

    };

    var init = function(socket, map) {

        setupReplaySettings(socket);

        $('#start').click(function() {
            console.log('Start Animation selected');
            Animation.startAnimation();
        });

        $('#stop').click(function() {
            console.log('Stop Animation selected');
            Animation.stopAnimation();
        });

        console.log("Getting between 1402531200000 and 1402617599999");
        cacheDataBetweenTS(socket, 1402531200000, 1402617599999);

    };


    var start = function(socket) {
      $('#leftmenu').show();
      Animation.initializeAnimation(this, 1402531200000, 1402617599999);

    };

    var stop = function(socket) {
      $('#leftmenu').hide();
    };

    var getVehicleData = function(id) {
        return vehicles[id];
    };

    var vehicles = function() {
        return _.keys(vehicles);
    };

    var Replay = {};
    Replay.init = init;
    Replay.start = start;
    Replay.stop = stop;

    Replay.getVehicleData = getVehicleData;
    Replay.vehicles = vehicles;

    return Replay;

});
