/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 27/01/13
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('mongodb');
//var rest = require('../util/rest.js');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var db;

var database= {
    ip:'localhost',
    port:27017,
    name:'cashcube',
    type:'mongodb'
}

var url=require('util').format('mongodb://%s:%d/%s',database.ip,database.port,database.name);
//var url=require('util').format('mongodb://663a9748-776b-4d72-9b91-443da8eeb3c0:e36ef048-0346-460b-aa84-17f96c686ed1@localhost:10000/db');

new Db.connect(url,function(err,nnd){
    db = nnd;
});

function getDaysFrom(from,to) {
    return Math.round((to.getTime() - from.getTime()) / 86400000);
}

module.exports.findGroup = function(req,res,next) {
    db.collection("movement", function(err, collection) {
        var filter = {};

        if ( req.query.fromDate || req.query.toDate ) {
            filter.date={};

            if ( req.query.fromDate ) {
                filter.date['$gte'] = new Date(req.query.fromDate);
            }

            if ( req.query.toDate ) {
                filter.date['$lte'] = new Date(req.query.toDate);
            }
        }

        collection.find(filter).sort({date:1}).toArray(function (err, items) {
//            var results = {};
            var firstDate;
            var week;
            for( var i in items) {
                var item = items[i];
                if (!firstDate) {
                    firstDate = new Date(item.date);
                    week = item.week = 0;
                } else {
                    var actual = Math.round(getDaysFrom(firstDate,new Date(item.date))/7);
                    item.week = actual;
                }
            }
            res.send(items);
        });


    });
}

module.exports.findAll = function(req,res,next) {
    db.collection("movement", function(err, collection) {
        var filter = {};

        if ( req.query.fromDate || req.query.toDate ) {
            filter.date={};

            if ( req.query.fromDate ) {
                filter.date['$gte'] = new Date(req.query.fromDate);
            }

            if ( req.query.toDate ) {
                filter.date['$lte'] = new Date(req.query.toDate);
            }
        }




        function doFind(accounts) {
            collection.find(filter).sort({_id:1}).toArray(function (err, items) {
                var accountsMap = {};
                for (var i in items) {
                    var item = items[i];
                    if ( !accounts || accounts.indexOf(item.account)>-1 ) {
                        if ( !accountsMap[item.account]) {
                            var account = {
                                account:item.account,
                                credit:item.amount,
                                amount:item.amount,
                                debit:0
                            };
                            accountsMap[item.account] = account;
                        } else {
                            accountsMap[item.account].credit += item.amount;
                            accountsMap[item.account].amount += item.amount;
                        }
                    }
                    if ( !accounts || accounts.indexOf(item.accountTarget)>-1 ) {
                        if (!accountsMap[item.accountTarget]) {
                            var account = {
                                account:item.accountTarget,
                                debit:item.amount,
                                amount:-item.amount,
                                credit:0
                            };
                            accountsMap[item.accountTarget] = account;
                        } else {
                            accountsMap[item.accountTarget].debit += item.amount;
                            accountsMap[item.accountTarget].amount -= item.amount;
                        }
                    }

                }
                var results = [];
                for (var a in accountsMap) {
                    accountsMap[a].amount = Math.round(accountsMap[a].amount);
                    accountsMap[a].credit = Math.round(accountsMap[a].credit);
                    accountsMap[a].debit = Math.round(accountsMap[a].debit);
                    results.push(accountsMap[a]);
                }
                res.send(results);
            });
        }
        if ( req.query.category ) {
            //TODO, filtrar todas las cuentas que sean de la categoria buscada.
            db.collection("account", function(err, collection) {
                collection.find({category:req.query.category}).toArray(function (err, items) {
                    var accounts = [];
                    for ( var i in items ) {
                        accounts.push(items[i]._id);
                    }
//                    filter.account = {$in:accounts};
                    filter.$or = [
                        { account:{$in:accounts} },
                        { accountTarget:{$in:accounts} }
                    ];
                    doFind(accounts);
                });
            });

        } else {
            doFind();
        }

    });
}

