const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Simplified mongo!

const index = require('./routes/index');
const users = require('./routes/users');
const scores = require('./routes/scores');
const saveFiles = require('./routes/saveFiles');


const app = express();

// Connect to mongo database! It is hosted, by default, on 27017
// TODO: Determine which URL to use based off of environment
mongoose.connect('mongodb://TestUser:test123@ds227199.mlab.com:27199/foolsgambit');
//mongoose.connect('mongodb://localhost/test');

// Configuring Passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
app.use(expressSession({secret: 'IBelieveInTheHeartOfTheCardsYeahhhh'}));
app.use(passport.initialize());
app.use(passport.session());

// passport config
const Account = require('./models/user');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

//front end
app.use(express.static('public'));
app.use(express.static('files'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/scores', scores);
app.use('/saveFiles', saveFiles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
