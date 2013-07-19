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
