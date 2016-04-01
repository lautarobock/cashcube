
/**
 * Module dependencies.
 */
console.log("MONGO_URI",process.env.MONGO_URI);

var mongo = require('mongodb');
var db = require("./util/db");

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var database= db.config;

var url=require('util').format(database.url);

new Db.connect(url,function(err,nnd){
    db = nnd;
});
