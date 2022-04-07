var express = require('express');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var basicAuth = require('express-basic-auth');
var morgan = require('morgan')

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// log every request in format:
// :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
app.use(morgan('short'))

// -----------------------------------------------------------------------------
// the WebServer now listens to http://localhost:3030 / http gets and posts
// -----------------------------------------------------------------------------
var server = app.listen(3030, function() {
    console.log('***********************************');
    console.log('listening:', 3030);
    console.log('***********************************');
  });

/*
 * Routes
 */
app.use('/tours', require('./API/routes/tours'));
app.use('/user', require('./API/routes/user'));
// demo routes
var routes = require('./API/routes/testRoutes');
routes(app);

// catch 404
app.use((req, res, next) => {
  console.log(`Error 404 on ${req.url}.`);
  res.status(404).send({ status: 404, error: 'Not found' });
});
