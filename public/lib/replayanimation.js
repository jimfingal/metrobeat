define(['jquery', 'underscore', 'lib/replay'], function($, _, Replay) {

    var start_time;
    var end_time;
    var current_time;
    var speed_multiplier = 60;

    var animation_start_ts;

    var requestID;

    var playing = false;

    var initializeAnimation = function(start, end) {
        start_time = start;
        end = end;
        current_time = start;
    };

    function step(timestamp) {
      if (playing) {
          var progress = timestamp - animation_start_ts;
          console.log(progress);
          window.requestAnimationFrame(step);
      }
    };

    var startAnimation = function() {
        if (!playing) {
            animation_start_ts = Date.now();
            requestID = window.requestAnimationFrame(step);
            playing = true;
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
