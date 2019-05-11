const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const dbs = require('./libs/dbs');
const config = require('./config/' + (process.env.NODE_ENV || 'development'));
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('./repo/userRepository');

const customer = require('./routes/customer');
const seller = require('./routes/seller');
const logout = require('./routes/logout');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: config.sessionSecret,
  store: new redisStore({client: dbs.redis}),
  saveUninitialized: false, resave: false }));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((userIdAndRoleId, done) => done(null, userIdAndRoleId));
passport.deserializeUser((userIdAndRoleId, done) =>
User.getByIdAndRole(userIdAndRoleId)
    .then(user => done(null, user)) .catch(err => done(err)));
passport.use('local', new localStrategy({
  usernameField: 'phone',
  passwordField: 'password',
  passReqToCallback: true },
    (req, phone, password, done) =>
        User.login(req.body)
            .then(user => done(null, {id: user.id, roleId: user.roleId})) .catch(err => done(err)) ));

app.use('/customer', customer);
app.use('/seller', seller);

app.use('/logout', logout);

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
