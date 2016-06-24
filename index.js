var express     = require('express');
var exphbs      = require('express-handlebars');
var app         = require('express')();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var moment      = require('moment');

var jwt         = require('jsonwebtoken');

// var User        = require('./app/models/user');

var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.use(express.static('./public'));
app.engine('.hbs', exphbs({defaultLayout: 'single', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('superSecret', configDB.superSecret);
require('./app/routes.js')(express, app, jwt, moment);

http.listen(3000, function(){
    console.log('listening on *:3000');
});