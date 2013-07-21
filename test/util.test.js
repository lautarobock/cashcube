/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 6/06/13
 * Time: 8:20
 * To change this template use File | Settings | File Templates.
 */

var util = require("../public/js/util.js");

//Nodeunit
exports.testCreateFirstDay = function(test) {
    var date = util.createFirstDay(2013,7);
    console.log('GENERATE DATE: ' + date);
    test.equal(date.getDay(),1);
    test.equal(date.getMonth(),6);
    test.equal(date.getYear(),113);
    test.done();
};


exports.testGetWeek = function(test) {
    var week = util.getWeek(1);
    test.equal(week,1);

    week = util.getWeek(2);
    test.equal(week,1);
    week = util.getWeek(6);
    test.equal(week,1);
    week = util.getWeek(7);
    test.equal(week,1);

    week = util.getWeek(8);
    test.equal(week,2);

    week = util.getWeek(13);
    test.equal(week,2);
    week = util.getWeek(14);
    test.equal(week,2);

    test.done();
};