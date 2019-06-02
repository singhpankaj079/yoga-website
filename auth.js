
// IMPORTING REQUIRED PACKAGES

var express = require('express');
var router = express.Router({mergeParams: true});
var passport = require('passport');
var Users = require('./models/user');

// TO PASS 'user' OBJECT TO ALL THE EJS TEMPLATES

router.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// SIGN UP FORM

router.get('/signup', function(req, res){
  res.render('signup');
});


// LOGIN FORM

router.get('/login', function(req, res){
   res.render('login');
});


// LOGOUT

router.get('/logout', function(req, res){
   req.logout();
   req.flash('success', 'Successfully logged out!!')
   res.redirect('/');
});


// SUBMITTING THE SIGN UP REQUEST

router.post('/signup', function(req, res){
    Users.register(new Users({username: req.body.username}), req.body.password, function(err, user){
      if (err) { 
        console.log(err); 
        req.flash('error', 'User with given username already exists!!');
        res.redirect('/signup');
        
      }
      else {
        user.name = req.body.name;
        // user.occupation = req.body.occupation;
        user.address = req.body.address;
        user.mobno = req.body.mobno;
        user.save(function(err, saveduser){
             if(err) console.log(err);
             else console.log(saveduser);
        });
        passport.authenticate('local')(req, res, function(){
          req.flash('success','Welcome to Ashtanga Yoga Shala!!');
          res.redirect('/');
            
        });
      }
    }) 
});


// LOGGING IN 

router.post('/login', passport.authenticate('local'),function(req, res){
    if (req.isAuthenticated()) {req.flash('success', 'Successfully logged in!!');res.redirect('/');}
    else { req.flash('error','invalid username or password!!'); res.redirect('/login');}

});


module.exports = router;