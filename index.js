
// IMPORTING REQUIRED PACKAGES

var express = require('express');
var router = express.Router({mergeParams: true});
var passport = require('passport');
var Articles = require('./models/article');
var Videos = require('./models/video');
var Joinrequests = require('./models/joinrequest');
var Videos = require('./models/video');
var Users = require('./models/user');
var middlewareObj = require('./middleware');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

// TO PASS 'user' OBJECT TO ALL THE EJS TEMPLATES


router.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// HOMEPAGE

router.get('/', function(req, res) {
	  Articles.find({}, function(err, articles){
  	if (err) console.log(err);
  	else res.render('homepage', { articles: articles});
  });
});


// ASHTANGA YOGA

router.get('/ashtanga', function(req, res) {
		
  Articles.find({}, function(err, articles){
  	if (err) console.log(err);
  	else res.render('ashtanga', {articles: articles});
  });
   
});


// POWER YOGA

router.get('/poweryoga', function(req, res) {
		
  Articles.find({}, function(err, articles){
  	if (err) console.log(err);
  	else res.render('poweryoga', {articles: articles});
  });
   
});


// TRADITIONAL YOGA

router.get('/traditional', function(req, res){
 Articles.find({}, function(err, articles){
    if (err) console.log(err);
    else res.render('traditional', {articles: articles});
  });
})
// VIDEOS

router.get('/videos', function(req, res){
  Videos.find({}, function(err, videos){
  if (err)console.log(err);
  res.render('videos', {videos: videos});
  });
});


// FORM FOR JOINING THE CENTER

router.get('/join', middlewareObj.isLoggedIn, function(req, res){
  	res.render('form');
});


// PROFILES 

router.get('/profiles', middlewareObj.isAdmin, function(req, res){
     Users.find({}, function(err, users){
      if (err) console.log(err);
      else res.render('profiles', {users: users});
     });
});


// SUBMITTING THE JOIN FORM

router.post('/join', middlewareObj.isLoggedIn, function(req, res){

   var request = req.body.request;
     Joinrequests.create(request, function(err){
	    	if (err) console.log(err);
    });
    res.redirect('/join');
});


// SUBMITTING VIDEO FORM

router.post('/videos', middlewareObj.isAdmin, function(req, res){
  var video = req.body.video;
  Videos.create(video, function(err, added){
    if (err)console.log(err);
    else res.redirect('/videos');
  });
});

// DELETING A VIDEO

router.delete('/videos/:id', function(req, res){
   Videos.deleteOne({_id: ObjectId(req.params.id)}, function(err, video){
    if (err)console.log(err);
    else res.redirect('/videos');
   });
});

module.exports = router;