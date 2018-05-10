
var mongo = require('mongodb');
var cube = require("../services/cube.js");
var db = require("../util/db");
var overview = require("./overview");

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure, MongoClient = mongo.MongoClient;

var db;

var database= db.config;

var url=require('util').format(database.url);

MongoClient.connect(url,function(err,nnd){
    db = nnd.db('cashcube');
});

module.exports.byMonth = function(req, res) {

    var QUERY = [
        { $match: { accountTarget: req.params.account } },
        { $group: {
            _id: { $dateToString: { format: "%Y%m", date: "$date" }  },
            year:{ $avg:{ $year: "$date" }}, month:{ $avg:{ $month: "$date" }},
            totalCurrency:  { $sum: { $multiply: [ "$amount", "$accountTargetCurrency" ] } },
            total: { $sum: "$amount" }
        }},
        { $sort: { _id: 1 } }
    ];
    if ( req.query.from ) QUERY.push({$match: {_id: {$gte:req.query.from} } });
    if ( req.query.to ) QUERY.push({$match: {_id: {$lte:req.query.to} } });
    if ( req.query.tags ) QUERY[0].$match.tags = req.query.tags;

    db.collection("movement", function(err, collection) {
        collection.aggregate(QUERY).toArray().then(function (items) {
            res.send(items);
        });
    });

};

module.exports.expenses = function(req, res) {

    function map(list, field) {
        var map = [];
        for (var i=0; i<list.length; i++ ) {
            console.log(JSON.stringify(list[i]));
            map.push(list[i][field]);
        }
        return map;
    }

    var QUERY = [
        { $match: { accountTarget: {$in:map(overview.EXPENSES_ACCOUNTS,'name')} } },
        { $group: {
            _id: { $dateToString: { format: "%Y%m", date: "$date" }  },
            year:{ $avg:{ $year: "$date" }}, month:{ $avg:{ $month: "$date" }},
            total: { $sum: "$amount" }
        }},
        { $sort: { _id: 1 } }
    ];
    if ( req.query.from ) QUERY.push({$match: {_id: {$gte:req.query.from} } });
    if ( req.query.to ) QUERY.push({$match: {_id: {$lte:req.query.to} } });

    db.collection("movement", function(err, collection) {
        collection.aggregate(QUERY).toArray().then(function (items) {
            res.send(items);
        });
    });

};
