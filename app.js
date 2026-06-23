var createError = require('http-errors');
var express = require('express');
// require("./config/mongoose-connection");
require("dotenv").config();
const connectDB = require("./config/db");

(async () => {
  await connectDB();
})();

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const userModel = require("./models/user");
// console.log("userModel =", userModel);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// here we need to setup passport below 
app.use(
  session({
    secret: "assu panjo har kabootar",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(userModel.authenticate()));
passport.serializeUser(userModel.serializeUser());
passport.deserializeUser(userModel.deserializeUser());

app.use(function(req, res, next){
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
//

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
