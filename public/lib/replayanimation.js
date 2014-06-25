define(['jquery', 'underscore', 'lib/routes'], function($, _, Routes) {

    var start_time;
    var end_time;
    var current_time;
    var speed_multiplier = 60;

    var animation_start_ts;

    var requestID;

    var playing = false;

    var Replay;

    var current_frame = {};
    var last;
    var start = null;

    var mapToAnimationTime = function(diff) {
        return start_time + diff;
    };

    var initializeAnimation = function(Rply, start, end) {
        start_time = start;
        end = end;
        current_time = start;
        Replay = Rply;
    };



    function step(timestamp) {

      if (playing) {

          var progress;
          if (start === null) {
            start = timestamp;
          }
          progress = timestamp - start;

          console.log(progress);
          
          var animation_time = mapToAnimationTime(progress * speed_multiplier);

          _.each(_.pairs(current_frame), function(pair) {

            var data = Replay.getVehicleData(parseInt(pair[0]));

            if (data) {
                var next_moment = data[pair[1]];
                //console.log(next_moment)
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

    var startAnimation = function() {
        if (!playing) {
            animation_start_ts = Date.now();
            last = animation_start_ts;
            start = null;
            requestID = window.requestAnimationFrame(step);
            playing = true;
            initializeVehicles();
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
