var rest = require("../util/rest.js");

module.exports = rest.build("account",true);

function convertBool(req, att) {
    if (req.query[att] != null) {
        if (req.query[att] == "true" || req.query[att] == "TRUE") {
            req.query[att] = true;
        } else {
            req.query[att] = false;
        }
    }
}

//module.exports.findAll = function(req,res,next) {
//    convertBool(req, "tourist");
//    convertBool(req, "guide");
//    rest.build("user").findAll(req,res,next);
//}

module.exports.pre = function(req,res,next,operation) {
    if ( operation == 'add' || operation == 'update' ) {
        req.body.active = (req.body.active == 'true');
    }
};
