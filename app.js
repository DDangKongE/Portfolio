const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const passport = require('passport');
const passportConfig = require('./config/passport');
const session = require('express-session');
const flash = require('connect-flash');
const cookieSession = require('cookie-session');
const expressDefend = require('express-defend');

const rootRouter = require('./routes/root');
const mainRouter = require('./routes/main');
const manageRouter = require('./routes/manager');

const app = express();

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGO_DB_PF);
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieSession({
  keys: ['node_han'],
  maxAge: 1000 * 60 * 10
}));

// Middleware setup
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({ secret: 'secretcode', resave: true, saveUninitialized: false })); // 세션 활성화
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결
passportConfig(); // 이 부분 추가

// expressDefend
app.use(expressDefend.protect({ 
  maxAttempts: 5,                   // (default: 5) number of attempts until "onMaxAttemptsReached" gets triggered
  dropSuspiciousRequest: true,      // respond 403 Forbidden when max attempts count is reached
  consoleLogging: true,             // (default: true) enable console logging
  logFile: 'suspicious.log',        // if specified, express-defend will log it's output here
  onMaxAttemptsReached: function(ipAddress, url){
      console.log('IP address ' + ipAddress + ' is considered to be malicious, URL: ' + url);
  } 
}));

// Router setup
app.use('/', rootRouter);
app.use('/portfolio', mainRouter);
app.use('/portfolio/manager/', manageRouter);

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
