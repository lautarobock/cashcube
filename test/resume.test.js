/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 6/06/13
 * Time: 8:20
 * To change this template use File | Settings | File Templates.
 */

//var resources = require("./resources.js");

var resume = require("../routes/resume.js");

//Nodeunit
exports.testFindCube = function(test) {
	var res = {
		send: function(value) {
			console.log(value);
			console.log("fin value");
			console.log(new Date(2013,6,1).toUTCString());
			test.equal(value[new Date(2013,6,1).toUTCString()].caixa,9.9,'caixa dia 1');
			test.equal(value[new Date(2013,6,1).toUTCString()].bonus,-3.9,'bonus dia 1');
			test.equal(value[new Date(2013,6,1).toUTCString()].cash,3.19,'cash dia 1');
			test.equal(value[new Date(2013,6,1).toUTCString()]['super'],-3.19,'super dia 1');
			test.equal(value[new Date(2013,6,1).toUTCString()].vicio,-6,'vicio dia 1');

			console.log(new Date(2013,6,17).toUTCString());
			test.equal(value[new Date(2013,6,17).toUTCString()].caixa,46.150000000000006,'caixa dia 17');
			test.equal(value[new Date(2013,6,17).toUTCString()].deudas_general,-0.3000000000000007,'deudas dia 17');
			test.equal(value[new Date(2013,6,17).toUTCString()].cash,-19,'cash dia 17');
			test.equal(value[new Date(2013,6,17).toUTCString()].salidas,-26.85,'vicio dia 17');

		    test.done();
		}
	};
	resume.findCube({},res);
	
    /*var date = util.createFirstDay(2013,7);
    console.log('GENERATE DATE: ' + date);
    console.log('GENERATE DATE (ToString): ' + date.toString());
    test.equal(date.getDay(),1);
    test.equal(date.getMonth(),6);
    test.equal(date.getYear(),113);*/

};
