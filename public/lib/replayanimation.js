define(['jquery', 'underscore', 'lib/routes', 'moment', 'lib/routecolors'],
 function($, _, Routes, moment, Colors) {


    var marker_helper;

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

    var map;

    var mapToAnimationTime = function(diff) {
        return start_time + diff;
    };


    var Animation = function(marker_helper, Replay) {

        this.initializeVehicles = function() {
            _.each(Replay.vehicles(), function(vehicle_id) {
                current_frame[vehicle_id] = 0;
            });

            console.log(current_frame);
        };

        this.step = function reStep(timestamp) {

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
                            marker_helper.updateVehicle(vehicle, 
                                                        next_moment['r'], 
                                                        next_moment['g'][1],
                                                        next_moment['g'][0]);
                            current_frame[vehicle] = frame_num + 1;
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
                last = animation_start_ts;
                start = null;
                requestID = window.requestAnimationFrame(this.step);
                playing = true;
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
