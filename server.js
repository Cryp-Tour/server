const express = require('express');
const bodyParser = require('body-parser'); // helper routines to parse data as JSON in request body
const DBO = require('./db/dbo'); //module for db requests and db creation
const morgan = require('morgan');
const rateLimit = require('express-rate-limit')

//----------------------------------------------------------------------------
// connect to db
//----------------------------------------------------------------------------
const dao = new DBO('./db/db/web.sqlite');
/* example run and get
dao.run(
  `INSERT INTO user(firstName,surName,pwdHash,eMail,userName) VALUES(?,?,?,?,?)`,
  ['test','test','test','test','test']
).then(function(value){
  return dao.get('SELECT * from user');
}).then(
  function(value) {
    console.log(value);
  }
);
*/

//----------------------------------------------------------------------------
// create a new express based Web Server
// ---------------------------------------------------------------------------
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


const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 60, // Limit each IP to 60 requests per `window`
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use('/', limiter);


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