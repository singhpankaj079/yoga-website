var middlewareObj = {};
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Comments = require('./models/comment');
var express = require('express');
var router = express.Router({mergeParams: true});


// isLoggedIn MIDDLEWARE

middlewareObj.isLoggedIn = function (req, res, next){
     if (req.isAuthenticated())
      return next();
    else {
      req.flash('error', 'Please login first');
    	res.redirect('/login');
    	}
}


// isAdmin MIDDLEWARE

middlewareObj.isAdmin = function (req, res, next){
  if (req.isAuthenticated() && req.user.username === 'admin')
    return next();
  else res.send('SORRY ONLY ADMIN HAS THE RIGHT TO DO SO');
}


// checkCommentOwnership MIDDLEWARE

middlewareObj.checkCommentOwnership = function(req, res, next){
	Comments.findById(ObjectId(req.params.cid), function(err, comment){
    if (err) console.log(err);
	  else if (req.user && comment.author === req.user.username )
			next();
		else res.send('Either you are not logged in or you don\'t have the required permission');
	});
	
};


module.exports = middlewareObj;