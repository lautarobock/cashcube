/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 27/01/13
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('mongodb');
//var rest = require('../util/rest.js');
var cube = require("../services/cube.js");

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

module.exports.saveCubeDefinition = function(req,res,next) {
    db.collection("cubedefinition", function(err, collection) {
        collection.findOne({"_id":req.body._id},function(err, item) {
            if ( !item ) {
                collection.insert(req.body, {safe:true}, function (err, result) {
                    res.send(result[0]);
                });
            } else  {
                collection.update({_id:req.body._id}, req.body, {safe:true}, function (err, result) {
                    res.send(req.body);
                });
            }
        });

    });
};

var defaultDefinition =  [
        {
            "account": "super",
            "name": "Super",
            "width": "70",
            "maxDay": 10,
            "maxWeek": 70,
            "maxMonth": null,
            "maxRest": 10,
            "trail": 45,
            "section": 0
        },
        {
            "account": "vicio",
            "name": "Vicio",
            "width": "70",
            "maxDay": null,
            "maxWeek": 20,
            "maxMonth": null,
            "maxRest": 0,
            "trail": 4,
            "section": 0
        },
        {
            "account":"bonus",
            "name": "Bonus",
            "width": "70",
            "maxDay": null,
            "maxWeek": null,
            "maxMonth": 80,
            "maxRest": 0,
            "trail": 0,
            "section": 0
        },
        {
            "account": "salidas",
            "name": "Salidas",
            "width": "70",
            "maxWeek": 35,
            "maxMonth": 150,
            "maxRest": 10,
            "section": 0
        },
        {
            "account": "extra",
            "name": "Extra",
            "width": "70",
            "section": 1
        },
        {
            "account": "fijos",
            "name": "Fijos",
            "width": "70",
            "maxMonth": 800,
            "section": 1
        },
        {
            "account": "viajes",
            "name": "Viajes",
            "width": "70",
            "section": 1
        }
    ];

function innerFindCubeDefinition(id, cb) {
    db.collection("cubedefinition", function (err, collection) {
        collection.findOne({"_id":id}, function (err, item) {
            if (item) {
                cb(item);
            } else {
                db.collection("cubedefinition", function (err, collection) {
                    collection.find({}).sort({_id:0}).toArray(function (err, items) {
                        if (items.length > 0) {
                            items[0]._id = id;
                            items[0].startDow = 4;
                            items[0].year = parseInt(id.substr(0,4));
                            items[0].month = parseInt(id.substr(4,2))-1;
                            cb(items[0]);
                        } else {
                            var def = {
                                _id:id,
                                accounts:defaultDefinition
                            };
                            cb(def);
                        }
                    });
                });
            }
        });
    });
}
module.exports.findCubeDefinition = function(req,res,next) {
    innerFindCubeDefinition(req.params.id, function(def) {
        res.send(def);
    });
};

module.exports.findCube = function(req,res,next) {

    var m = req.params.month;
    if ( m<10) m='0'+m;
    var def_id = req.params.year+m;

    innerFindCubeDefinition(def_id,function(def) {
        db.collection("movement", function(err, collection) {
            var filter = {};

            filter.date={};

            //-2 is added to fix UTC change time. (ugly)
            filter.date['$gte'] = new Date(req.params.year,req.params.month-1,1);
            filter.date['$gte'].setHours(filter.date['$gte'].getHours()-2);
            var to = new Date(req.params.year,req.params.month,1);
            to.setHours(to.getHours()-2);

            filter.date['$lt'] = to;

            collection.find(filter).sort({date:1}).toArray(function (err, items) {
                var results = cube.findCube(items,def);
                res.send(results);
            });


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

