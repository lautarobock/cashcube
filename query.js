
/**
 * Module dependencies.
 */
console.log("MONGO_URI",process.env.MONGO_URI);

var mongo = require('mongodb');
var db = require("./util/db");

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure, MongoClient = mongo.MongoClient;

var database= db.config;

var url=require('util').format(database.url);

MongoClient.connect(url,function(err,nnd){
    db = nnd.db('cashcube');
});
