/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 6/06/13
 * Time: 8:20
 * To change this template use File | Settings | File Templates.
 */

//var resources = require("./resources.js");


//Nodeunit
exports.testFindCube = function(test) {
    var items = require("../test/resources.js").movements;
    var value = require("../services/cube.js").findCube(items);

    test.equal(value.days[1].caixa.value,9.9,'caixa dia 1');
    test.equal(value.days[1].bonus.value,-3.9,'bonus dia 1');
    test.equal(value.days[1].cash.value,3.19,'cash dia 1');
    test.equal(value.days[1]['super'].value,-3.19,'super dia 1');
    test.equal(value.days[1].vicio.value,-6,'vicio dia 1');


    test.equal(value.days[17].caixa.value,46.150000000000006,'caixa dia 17');
    test.equal(value.days[17].deudas_general.value,-0.3000000000000007,'deudas dia 17');
    test.equal(value.days[17].cash.value,-19,'cash dia 17');
    test.equal(value.days[17].salidas.value,-26.85,'vicio dia 17');

    test.equal(value.weeks[1].bonus.value,-69.85,'Bonus Semana 1');
    test.equal(value.weeks[1]['super'].value,-63.82,'Super Semana 1');
    test.equal(value.weeks[1].vicio.value,-18.25,'Vicio Semana 1');
    test.equal(value.weeks[1].salidas.value,-46.19,'Salidas Semana 1');


    test.done();

    /*var date = util.createFirstDay(2013,7);
    console.log('GENERATE DATE: ' + date);
    console.log('GENERATE DATE (ToString): ' + date.toString());
    test.equal(date.getDay(),1);
    test.equal(date.getMonth(),6);
    test.equal(date.getYear(),113);*/

};
