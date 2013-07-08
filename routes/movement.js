var rest = require("../util/rest.js");
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

module.exports = rest.build("movement",false,{date:-1});


module.exports.pre = function(req,res,next,operation) {
    if ( operation == 'add' || operation == 'update' ) {
        req.body.amount = parseFloat(req.body.amount.replace(',','.'));
        req.body.accountCurrency = parseFloat(req.body.accountCurrency);
        req.body.accountTargetCurrency = parseFloat(req.body.accountTargetCurrency);
        req.body.date = new Date(req.body.date);
        var tags = req.body.tags.split(",");
        var target = {};
        for ( var i = 0; i<tags.length; i++ ) {
            target[tags[i].trim()] = tags[i].trim();
        }
        tags = [];
        for ( var t in target ) {
            if ( target[t] && target[t] != '')
            tags.push(target[t]);
        }
        req.body.tags = tags;
    }
}

module.exports.post = function(req,res,next,args,operation) {
    function joinTags(item) {
        if (item.tags) item.tags = item.tags.join(", ");
    }

    if ( operation == 'findAll' ) {
        for( var i in args ) {
            joinTags(args[i]);
        }
    } else if ( operation == "update" || operation == "add" ) {
        joinTags(args);
    }
}