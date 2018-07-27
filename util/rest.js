/**
 * Created with JetBrains WebStorm.
 * User: lautaro
 * Date: 27/01/13
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('mongodb');
var db = require("./db");
var MongoClient = require('mongodb').MongoClient;

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure,
    ObjectID = require('mongodb').ObjectID;

var db;

var database= db.config;

var url=require('util').format(database.url);
//var url=require('util').format('mongodb://663a9748-776b-4d72-9b91-443da8eeb3c0:e36ef048-0346-460b-aa84-17f96c686ed1@localhost:10000/db');

// new Db.connect(url,function(err,nnd){
//     db = nnd;
// });
MongoClient.connect(url).then(nnd => {
    db = nnd;
});

/**
 * create scaffold service
 * @param app
 * @param collection
 * @param path
 */
module.exports.buildExpress = function(app,collection,path) {
    var service = module.exports.build(collection);
    path = path || collection;
    app.get('/' + path, service.findAll);
    app.get('/' + path + '/:id', service.findById);
    app.post('/' + path, service.add);
    app.put('/' + path + '/:id', service.update);
    app.delete('' + path + '/:id', service.delete);
}

module.exports.build= function(name,notAuto,orderBy) {
    return {
        name: name,
        pre: function(req,res,next,operation) {
            //do nothing
        },
        post: function(req,res,next,args,operation) {
            //do nothing
        },
        findAll:function(req,res,next) {
            require("../routes/"+name).pre(req,res,next,"findAll");
            db.collection(name, function(err, collection) {
                var filter = {};
                if ( req.query.filter ) {
                    filter = eval('(' + req.query.filter + ')');
                }
                var q = collection.find(filter).sort(orderBy?orderBy:{_id:1});
                if ( req.query.page ) {
                    var pageSize = parseInt(req.query.pageSize)
                    var page = parseInt(req.query.page);
                    var skip = (page -1) * pageSize;
                    console.log("skip", skip, "pageSize", pageSize);
                    q = q.skip(skip).limit(pageSize);
                }
                q.toArray(function(err, items) {
                    require("../routes/"+name).post(req,res,next,items,"findAll");
                    res.send(items);
                });
            });
        },
        findById: function(req,res,next) {
            console.log(name, 'findById')
            require("../routes/"+name).pre(req,res,next,"findById");
            db.collection(name, function(err, collection) {
                console.log(err);
                collection.findOne({"_id":new ObjectID(req.params.id)},function(err, item) {
                    res.send(item);
                });
            });
        },
        add:function(req,res,next) {
            require("../routes/"+name).pre(req,res,next,"add");
            db.collection(name, function(err, collection) {
                collection.insert(req.body, {safe:true}, function (err, result) {
                    require("../routes/"+name).post(req,res,next,result.ops[0],"add");
                    res.send(result[0]);
                });
            });
        },
        update:function(req,res,next) {
            require("../routes/"+name).pre(req,res,next,"update");
            db.collection(name, function(err, collection) {
                var id;
                if ( notAuto ) {
                    id = req.params.id;
                } else {
                    id = new ObjectID(req.params.id);
                    req.body._id = id;
                }
                collection.update({_id:id}, req.body, {safe:true}, function (err, result) {
                    require("../routes/"+name).post(req,res,next,req.body,"update");
                    res.send(req.body);
                });
            });
        },
        delete:function(req,res,next) {
            require("../routes/"+name).pre(req,res,next,"delete");
            db.collection(name, function(err, collection) {
                var id;
                if ( notAuto ) {
                    id = req.params.id;
                } else {
                    id = new ObjectID(req.params.id);
                }
                collection.remove({_id:id},{safe:true}, function(err,result) {
                    res.send(req.body);
                });
            });
        }

    }
}

