var express = require('express');        // critical module for building a Web Server App
// Here are some basic packages we need together with express
var bodyParser = require('body-parser'); // helper routines to parse data as JSON in request body
var fetch = require('node-fetch');       // http Server requests similar to the Client Version
var basicAuth = require('express-basic-auth'); // Some basic HTTP Header Authorization
var DBO = require('./db/dbo'); //module for db requests and db creation
//----------------------------------------------------------------------------
// create a new express based Web Server
// ---------------------------------------------------------------------------
var app = express();
// app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');
// app.use('/static', express.static('/views/HTML'))
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// the WebServer now listens to http://localhost:3030 / http gets and posts
// -----------------------------------------------------------------------------
var server = app.listen(3030, function() {
    console.log('***********************************');
    console.log('listening:', 3030);
    console.log('***********************************');
  });


var routes = require('./API/routes/testRoutes'); //importing routes
routes(app); //register the route