
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
//var index = require('./routes/index');
var http = require('http');
var path = require('path');
var MongoStore = require("connect-mongo")(express);
var settings = require("./settings");
var flash = require("connect-flash");
var app = express();

// all environments
app.use(flash());
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon(__dirname+"/public/images/favicon.ico"));
app.use(express.logger('dev'));
//此处 已经被替换 app.user(express.bodyParse());
app.use(express.json());
app.use(express.urlencoded());
//替换完毕
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret:settings.cookieSecret,
    key : settings.db,
    cookie:{maxAge :1000 *60 *60 *24 *30},
    store:new MongoStore({
        db:settings.db
    })
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
routes(app);