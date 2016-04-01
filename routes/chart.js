
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
        { $sort: { _id: 1 } },
        {$match: {_id: {$gte:'201601'} } },
        {$match: {_id: {$lte:'201604'} } }
    ];

    db.collection("movement", function(err, collection) {
        collection.aggregate(QUERY, function (err1, items) {
            res.send(items);
        });
    });

};
