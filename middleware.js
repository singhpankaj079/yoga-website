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
  else res.send('SORRY YOU DON\'T HAVE THE PERMISSION TO DO SO' );
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


// checkReplyOwnership MIDDLEWARE

middlewareObj.checkReplyOwnership = function(req, res, next){
   if (req.isAuthenticated()){
    Comments.findById(ObjectId(req.params.cid), function(err, comment){
      if (err) console.log(err);
      else {
         for (var i = 0; i< comment.replies.length; i++){
          if (req.params.rid === comment.replies[i]._id.toString()){
            if (req.user.username === comment.replies[i].author)
              return next();
            else res.render('YOU DON\'T HAVE THE PERMISSION TO DO SO');  
          }
         }
      }
    });

   }
   else {req.flash('error', 'Please login first');
      res.redirect('/login');
    }
   
}

// checkProfileOwnership MIDDLEWARE

middlewareObj.checkProfileOwnership = function(req, res, next){
  if (req.isAuthenticated() && req.user.username === req.params.username){
    next();
  }
  else res.render('YOU DON\'T HAVE THE PERMISSION TO DO SO');
}

module.exports = middlewareObj;