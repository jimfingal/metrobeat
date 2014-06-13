var expect = require('chai').expect;
var MS_IN_DAY = require("../lib/timehelper").MS_IN_DAY;
var moment = require('moment');

describe('timehelper', function() {

    describe('moment tests', function() {

        console.log("MS in day: " + MS_IN_DAY);

        var june_11_2014 = (16233 * MS_IN_DAY) + 1534;
        var june_11_2014_start = 16233 * MS_IN_DAY;
        var june_12_2014_end = 16234 * MS_IN_DAY - 1;

        var moment_date = moment.utc(june_11_2014);
        var start = moment.utc(june_11_2014).startOf('day');            
        var end = moment.utc(june_11_2014).endOf('day');

        console.log("Rando: " + june_11_2014);
        console.log("Start: " + june_11_2014_start);
        console.log("End:   " + june_12_2014_end);
        console.log(moment_date.format("dddd, MMMM Do YYYY, h:mm:ss a"));
        console.log(start.format("dddd, MMMM Do YYYY, h:mm:ss a"));
        console.log(end.format("dddd, MMMM Do YYYY, h:mm:ss a"));

        it("should properly deal with unix timestamp", function() {
          expect(moment_date.valueOf()).to.equal(june_11_2014);
         });

        it("should deal with beginning of day", function() {
          expect(start.valueOf()).to.equal(june_11_2014_start);

        });

        it("should deal with end of day", function() {
          expect(end.valueOf()).to.equal(june_12_2014_end);
        });

    });
    
});
