
var mongo = require('mongodb');
var cube = require("../services/cube.js");
var db = require("../util/db");

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var db;

var database= db.config;

var url=require('util').format(database.url);

new Db.connect(url,function(err,nnd){
    db = nnd;
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
        collection.aggregate(QUERY, function (err1, items) {
            res.send(items);
        });
    });

};
