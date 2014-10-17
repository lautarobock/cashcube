var rest = require("../util/rest.js");
var mongo = require('mongodb');
var BSON = mongo.BSONPure;

module.exports = rest.build("movement",false,{date:-1});

var mongo = require('mongodb');
var db = require("../util/db");

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var database= db.config;

var url=require('util').format(database.url);
//var url=require('util').format('mongodb://663a9748-776b-4d72-9b91-443da8eeb3c0:e36ef048-0346-460b-aa84-17f96c686ed1@localhost:10000/db');

new Db.connect(url,function(err,nnd){
    db = nnd;
});

module.exports.pre = function(req,res,next,operation) {
    if ( operation == 'add' || operation == 'update' ) {
        req.body.amount = Math.round(parseFloat(eval('('+req.body.amount.toString().replace(/,/g,'.')+')'))*100,2)/100;
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

module.exports.total = function(req, res) {
    db.collection('movement', function(err, collection) {
        var filter = null;
        if ( req.query.filter ) {
            filter = eval('(' + req.query.filter + ')');
        }
        collection.find(filter).toArray(function(err, items) {
            var total = 0;
            for ( var i=0; i<items.length; i++ ) {
                total += items[i].amount;
            }
            res.send({
                value: total
            });
        });
    });
};


module.exports.count = function(req, res) {
    db.collection('movement', function(err, collection) {
        var filter = null;
        if ( req.query.filter ) {
            filter = eval('(' + req.query.filter + ')');
        }
        collection.count(filter, function(err, c) {
            res.send({
                value: c
            });
        });
    });
};

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