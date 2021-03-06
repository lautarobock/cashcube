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

exports.testWeekHelperGetAllWeeks = function(test) {
    //Helper for 2013 august and start on thursday (#4)
    var helper = new util.WeekHelper(2013,7,4);
    var all = helper.getAllWeeks();
    
    test.equal(all.length,5);
    test.equal(all[0].from,1);
    test.equal(all[0].to,7);
    test.equal(all[0].week,1);
    test.equal(all[1].from,8);
    test.equal(all[1].to,14);
    test.equal(all[1].week,2);
    test.equal(all[3].from,22);
    test.equal(all[3].to,28);
    test.equal(all[3].week,4);
    test.equal(all[4].from,29);
    test.equal(all[4].to,31);
    test.equal(all[4].week,5);
    
    //Helper for 2013 february and start on thursday (#4)
    helper = new util.WeekHelper(2013,1,4);
    all = helper.getAllWeeks();
    
    test.equal(all.length,5);
    test.equal(all[0].from,1);
    test.equal(all[0].to,6);
    test.equal(all[0].week,1);
    test.equal(all[4].from,28);
    test.equal(all[4].to,28);
    test.equal(all[4].week,5);
    
    //Helper for 2013 february and start on friday (#5)
    helper = new util.WeekHelper(2013,1,5);
    all = helper.getAllWeeks();
    
    test.equal(all.length,4);
    test.equal(all[0].from,1);
    test.equal(all[0].to,7);
    test.equal(all[0].week,1);
    test.equal(all[3].from,22);
    test.equal(all[3].to,28);
    test.equal(all[3].week,4);
    
    test.done();
};

exports.testWeekHelper = function(test) {
    //Helper for 2013 august and start on friday (#5)
    var helper = new util.WeekHelper(2013,7,5);

    var week = helper.getWeek(1);
    test.equal(week,1);
    
    week = helper.getWeek(2);
    test.equal(week,2);

    week = helper.getWeek(3);
    test.equal(week,2);

    week = helper.getWeek(7);
    test.equal(week,2);

    week = helper.getWeek(8);
    test.equal(week,2);

    week = helper.getWeek(9);
    test.equal(week,3);

    week = helper.getWeek(29);
    test.equal(week,5);

    week = helper.getWeek(30);
    test.equal(week,6);

    week = helper.getWeek(31);
    test.equal(week,6);
    
    
    //Helper for 2013 september and start on friday (#5)
    var helper = new util.WeekHelper(2013,8,5);

    var week = helper.getWeek(1);
    test.equal(week,1);
    
    week = helper.getWeek(5);
    test.equal(week,1);

    week = helper.getWeek(6);
    test.equal(week,2);

    week = helper.getWeek(12);
    test.equal(week,2);

    week = helper.getWeek(13);
    test.equal(week,3);

    week = helper.getWeek(19);
    test.equal(week,3);

    week = helper.getWeek(27);
    test.equal(week,5);

    week = helper.getWeek(30);
    test.equal(week,5);    
    
    test.done();
};

//exports.testGetWeekFrom = function(test) {
//    //Starting from Friday (#5)
//    //Jueves 1 de agosto 2013
//    var date = new Date(Date.UTC(2013,7,1));
//    var week = util.getWeekFrom(date,5);
//    test.equal(week,1);
//
//    //Viernes 2 de agosto 2013
//    date = new Date(Date.UTC(2013,7,2));
//    week = util.getWeekFrom(date,5);
//    test.equal(week,2);
//
//    test.done();
//};

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
