var express = require('express');        // critical module for building a Web Server App
var bodyParser = require('body-parser'); // helper routines to parse data as JSON in request body
var DBO = require('./db/dbo'); //module for db requests and db creation
var morgan = require('morgan');
const session = require('express-session');
const rateLimit = require('express-rate-limit')
const cryptoManager = require("./cryptoManager");
var cors = require('cors');
require('dotenv').config()

const random = (length = 8) => {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return str;

};

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

// connect blockchain
cryptoManager.connectBlockchain();

//----------------------------------------------------------------------------
// create a new express based Web Server
// ---------------------------------------------------------------------------
var allowedOrigins = ['http://localhost:8080','https://cryptour.dullmer.de/'];

var app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },credentials: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: random(60),
    resave: false,
    saveUninitialized: false,
    name: 'SessionID',
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'none', secure: true} // 1 week
}));
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
