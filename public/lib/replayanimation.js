define(['jquery', 'underscore', 'lib/routes', 'moment', 'lib/routecolors'],
 function($, _, Routes, moment, Colors) {


    var marker_helper;

    var start_time;
    var end_time;
    //var speed_multiplier = 360;

    var animation_start_ts;

    var requestID;

    var playing = false;

    var Replay;

    var current_frame = {};
    var last = null;

    var map;

    var THRESHOLD = 1000000;

    var mapToAnimationTime = function(diff) {
        return start_time + diff;
    };

    var speedMultiplier = function() {

        // TODO: easing
        return ($("#timeslider").slider("value") / 100) * 720;
    }


    var Animation = function(marker_helper, Replay) {

        $("#timeslider").slider({
          value: 50,
          orientation: "horizontal",
          animate: true
        });

        var progress_so_far = 0;

        this.initializeVehicles = function() {
            _.each(Replay.vehicles(), function(vehicle_id) {
                current_frame[vehicle_id] = 0;
            });

            //console.log(current_frame);
        };

        this.step = function reStep(timestamp) {

              if (playing) {

                  var progress;
                  if (last === null) {
                    last = timestamp;
                  }

                  var multiplier = speedMultiplier();
                  var diff = ((timestamp - last) * multiplier);
                  //console.log("ts: " + timestamp + ", last: " + last + ", multiplier: " + multiplier + ", diff: " + diff);
                  //console.log(progress_so_far);

                  progress_so_far = progress_so_far + diff;

                  var animation_time = mapToAnimationTime(progress_so_far);
                  if (animation_time > end_time) {
                    animation_time = 0;
                    progress_so_far = 0;
                  }

                  $("#time").text(moment.utc(animation_time).format('MMMM Do YYYY, h:mm:ss a'));

                  _.each(_.pairs(current_frame), function(pair) {

                    var vehicle = pair[0];
                    var frame_num = pair[1];

                    var data = Replay.getVehicleData(vehicle);

                    if (data && data[frame_num]) {
                        var next_moment = data[frame_num];
                        //console.log(next_moment)

                        if (next_moment['t'] < animation_time) {
                            marker_helper.updateVehicle(vehicle, 
                                                        next_moment['r'], 
                                                        next_moment['g'][1],
                                                        next_moment['g'][0]);
                            current_frame[vehicle] = frame_num + 1;
                        } else if (next_moment['t'] - animation_time > THRESHOLD) {
                            marker_helper.removeMarker(vehicle);
                        }
                    }
                  });

                  //console.log(accumulated);
                  last = timestamp;
                  window.requestAnimationFrame(reStep);
              }
        };

        this.initializeAnimation = function(start, end) {
            start_time = start;
            end_time = end;
        };

        this.initializeVehicles = function() {
            _.each(Replay.vehicles(), function(vehicle_id) {
                current_frame[vehicle_id] = 0;
            });
        };

        this.startAnimation = function(map) {
            if (!playing) {
                animation_start_ts = Date.now();
                start = null;
                requestID = window.requestAnimationFrame(this.step);
                playing = true;
                progress_so_far = 0;
                this.initializeVehicles();
            }
        };

        this.stopAnimation = function() {
            if (playing) {
                window.cancelAnimationFrame(requestID);
                playing = false;
            }
        };

    };

    return Animation;

});
