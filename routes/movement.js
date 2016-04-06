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

module.exports.findAll = function(req,res,next) {
    module.exports.pre(req,res,next,"findAll");
    db.collection("movement", function(err, collection) {
        var filter = createFilter(req.query);
        console.log("FILTER", JSON.stringify(filter,null,4));
        var q = collection.find(filter).sort({date:-1});
        if ( req.query.page ) {
            var pageSize = parseInt(req.query.pageSize)
            var page = parseInt(req.query.page);
            var skip = (page -1) * pageSize;
            console.log("skip", skip, "pageSize", pageSize);
            q = q.skip(skip).limit(pageSize);
        }
        q.toArray(function(err, items) {
            module.exports.post(req,res,next,items,"findAll");
            res.send(items);
        });
    });
};

module.exports.total = function(req, res) {
    db.collection('movement', function(err, collection) {
        var filter = createFilter(req.query);
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
        var filter = createFilter(req.query);
        collection.count(filter, function(err, c) {
            res.send({
                value: c
            });
        });
    });
};

function createFilter (query) {
    var filter = {};
    if ( query.filter ) {
        filter = eval('(' + query.filter + ')');
    }
    if (filter.searchFromDate) {
        filter.date = {'$gte': new Date(filter.searchFromDate)};
        delete filter.searchFromDate;
    }
    if (filter.searchToDate) {
        if ( filter.date ) {
            filter.date['$lte'] = new Date(filter.searchToDate);
        } else {
            filter.date = {'$lte': new Date(filter.searchToDate)};
        }
        delete filter.searchToDate;
    }
    if ( filter.searchInBoth ) {
        filter['$or'] = [{
            account: filter.account
        }, {
            accountTarget: filter.account
        }];
        delete filter.searchInBoth;
        delete filter.account;
    }
    return filter;
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
};

module.exports.allTags = function(req, res) {
    db.collection('movement', function(err, collection) {
        console.log(err);
        collection.find(
            {$where: 'this.tags.length>0'},
            {tags:1, account:1, accountTarget:1}
        ).toArray(function(err, c) {
            if ( !err ) {
                var tags = {
                    account: {},
                    accountTarget: {}
                };
                for ( var i=0; i<c.length; i++ ) {
                    for ( var j=0; j<c[i].tags.length; j++ ) {
                        tags.account[c[i].account] = tags.account[c[i].account] || {};
                        tags.accountTarget[c[i].accountTarget] = tags.accountTarget[c[i].accountTarget] || {};
                        tags.account[c[i].account][c[i].tags[j]]=1;
                        tags.accountTarget[c[i].accountTarget][c[i].tags[j]]=1;
                    }
                }
                var tagsLists = {
                    account: {},
                    accountTarget: {}
                };
                for ( var k in tags.account ) {
                    tagsLists.account[k] = [];
                    for ( var l in tags.account[k] ) {
                        tagsLists.account[k].push(l);
                    }
                }
                for ( var k in tags.accountTarget ) {
                    tagsLists.accountTarget[k] = [];
                    for ( var l in tags.accountTarget[k] ) {
                        tagsLists.accountTarget[k].push(l);
                    }
                }
                res.send(tagsLists);
            } else {
                res.send(err);
                console.log(err);
            }

        });
    });
};
