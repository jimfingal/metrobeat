var moment = require('moment');

var SECS_IN_HOUR = 60 * 60;
var SECS_IN_DAY = SECS_IN_HOUR * 24;
var MS_IN_DAY = SECS_IN_DAY * 1000;


var secsSoFarToday = function(unixtime, utc_offset) {
  return ((unixtime / 1000) + (SECS_IN_HOUR * utc_offset)) % SECS_IN_DAY;
};

var bucketGivenNChunks = function(unixtime, num_buckets, utc_offset) {
  var secs_so_far = Timehelper.secsSoFarToday(unixtime, utc_offset);
  var bucket_size = SECS_IN_DAY / num_buckets;
  var bucket = Math.floor(secs_so_far / bucket_size);
  return bucket;
};

var beforeAndAfterTimestamps = function(date) {

  var moment_date = moment(date);
  var start = moment_date.startOf('day');
  var end = moment_date.endOf('day');

  return [start.format('X'), end.format('X')];

};

module.exports.MS_IN_DAY = MS_IN_DAY;
