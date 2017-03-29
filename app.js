
/**
 * Module dependencies.
 */
console.log("MONGO_URI",process.env.MONGO_URI);

var express = require('express')
//  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , wine = require('./routes/wines');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('lac713'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
//  app.use(express.cookieSession());

});

app.configure('development', function(){
  app.use(express.errorHandler());
  app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
  app.use(express.bodyParser());
});


//Session verification interceptor
//app.all('/*.html', function(req,res,next){
//    var s = req.session;
//    if (s.user || req.url == "/index.html" ) {
//        next();
//    } else if ( !s.user && req.query["user"] == "lautaro" ) {
//        s.user = "jose";
//        next();
//    } else {
//        res.redirect("/index.html");
//    }
//});


//REST servces configuration
//var rest = require("./util/rest.js");
var services = ["user","account","currency","movement","category"];
for ( var i in services) {
    var service = services[i];
    var serviceModule = require("./routes/"+service+".js");
//    rest.buildExpress(app,service);
    app.get('/' + service , serviceModule.findAll);
    app.get('/'+ service +'/:id', serviceModule.findById);
    app.post('/' + service , serviceModule.add);
    app.put('/'+ service +'/:id', serviceModule.update);
    app.delete('/'+ service +'/:id', serviceModule.delete);
}

//Resume Services
var resume = require("./routes/resume.js");
var overview = require("./routes/overview.js");
var chart = require("./routes/chart.js");
//cors enable
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
app.get('/movement-count/count',require('./routes/movement').count);
app.get('/movement-count/total',require('./routes/movement').total);
app.get('/movement-tags', require('./routes/movement').allTags);
app.get('/resume',resume.findAll);
app.get('/group',resume.findGroup);
app.get('/cube/:year/:month',resume.findCube);
app.get('/overview/incomes',overview.incomes);
app.get('/overview/expenses',overview.expenses);
app.get('/overview/:year/:month',overview.find);
app.get('/chart/expenses', chart.expenses);
app.get('/chart/:account', chart.byMonth);
app.get('/balance/:year/:month',overview.findBalance);
app.get('/cubedefinition/:id',resume.findCubeDefinition);
app.post('/cubedefinition',resume.saveCubeDefinition);




//require("./util/rest.js").buildExpress(app,"tour");

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
