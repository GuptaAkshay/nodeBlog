var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');
var uploads = multer({ dest: './public/images/uploads' });
var flash = require('connect-flash');


var index = require('./routes/index');
var users = require('./routes/users');
var post = require('./routes/post');
var categories = require('./routes/categories');

var app = express();
app.locals.moment = require('moment');

app.locals.truncateText = function (text, length) {
	var truncatedText = text.substring(0,length);
	return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//handle express session
app.use(session({
	secret : 'secret',
	saveUninitialized : true,
	resave : true
	
}));


//Validator
app.use(expressValidator({
	errorFormatter: function (param, msg, value) {
		var namespaces  = param.split('.'),
			root = namespaces.shift(),
			formParam = root;
		
		while(namespaces.length){
			formParam += '[' + namespaces.shift() +']';
		}
		return{
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//handle connect flash
app.use(flash());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//db access to router
app.use(function (req, res, next) {
	req.db = db;
	next();
});

app.use('/', index);
app.use('/users', users);
app.use('/posts', post);
app.use('/categories', categories);

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
