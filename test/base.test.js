/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 6/06/13
 * Time: 8:20
 * To change this template use File | Settings | File Templates.
 */

//Expresso
//exports.testsBase = function(beforeExit, assert) {
//    assert.equal(6,6);
//};


//Nodeunit
exports.testBase = function(test) {
    test.expect(1);
    test.ok(true,"Test no pasado")
    test.done();
};
