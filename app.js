
// IMPORTING REQUIRED PACKAGES

var express = require('express');
var app = express();
var bodyParser = require('body-parser');  // to convert the body of the post request into JSON format
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require("express-sanitizer");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var passportLocalMongoose = require('passport-local-mongoose');
var session = require('express-session');
var articleRoutes = require('./articles');
var indexRoutes = require('./index');
var authRoutes = require('./auth');
var flash = require('connect-flash');


// INCLUDING THE MODELS

var Articles = require('./models/article');
var Joinrequests = require('./models/joinrequest'); 
var Videos = require('./models/video');
var Comments = require('./models/comment');
var Users = require('./models/user');


// SETTING UP THE PASSPORT

passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());


// SETTING UP THE APP

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(session({
   secret: 'there is nothing secret about this',
   resave: false,
   saveUninitialized: false
}));
app.use(flash());
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});
app.use(passport.initialize());
app.use(passport.session());


// SETTING UP THE MONGOOSE

//mongoose.set('debug', true);
mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true});
var ObjectId = mongoose.Types.ObjectId;

//mongoose.connect('mongodb://localhost/yoga',{useNewUrlParser: true});

// SETTING UP THE ROUTES

app.use('/', indexRoutes);
app.use('/articles', articleRoutes);
app.use(authRoutes);


// STARTING THE SERVER
// , process.env.IP process.env.PORT
app.listen(process.env.PORT , process.env.IP, (req, res) => {
    console.log('server is listening');
});


