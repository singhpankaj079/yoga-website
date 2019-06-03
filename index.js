
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

router.get('/profiles', middlewareObj.isLoggedIn, function(req, res){
     Users.find({}, function(err, users){
      if (err) console.log(err);
      else res.render('profiles', {users: users});
     });
});


// PROFILE OF A PARTICULAR USER

router.get('/profiles/:username', middlewareObj.isLoggedIn, function(req, res){
     Users.findOne({username: req.params.username} , function(err, user){
      if (err) console.log(err);
      else res.render('showprofile', {user: user});
     });
});


// READING THE JOIN REQUESTS

router.get('/joinrequests', middlewareObj.isAdmin, function(req, res){
  Joinrequests.find({}, function(err, requests){
    res.render('joinrequests', {requests: requests});
  })

});


// SUBMITTING THE JOIN FORM

router.post('/join', middlewareObj.isLoggedIn, function(req, res){

   var request = req.body.request;
   request.date = new Date().toDateString();
   request.username = req.user.username;
     Joinrequests.create(request, function(err){
	    	if (err) console.log(err);
    });
     req.flash('success','Join request successfully submitted');
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


// EDITING THE PROFILE

router.put('/profiles/:username', middlewareObj.checkProfileOwnership, function(req, res){
   var user = req.body.user;
   user.settings = { mobno_visibility: req.body.mobno_visibility, address_visibility: req.body.address_visibility, email_visibility: req.body.email_visibility};
   Users.updateOne({username: req.params.username},{$set: user}, function(err, updated){
    if (err) console.log(err);
    else {
      console.log(updated);
      res.redirect('/profiles/'+ req.params.username);
    }
   })
});


// DELETING A VIDEO

router.delete('/videos/:id', middlewareObj.isAdmin, function(req, res){
   Videos.deleteOne({_id: ObjectId(req.params.id)}, function(err, video){
    if (err)console.log(err);
    else res.redirect('/videos');
   });
});

module.exports = router;