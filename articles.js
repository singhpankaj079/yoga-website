
// IMPORTING REQUIRED PACKAGES

var express = require('express');
var router = express.Router({mergeParams: true});
var Articles = require('./models/article');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Comments = require('./models/comment');
var middlewareObj = require('./middleware');

//TO PASS 'user' OBJECT TO ALL THE EJS TEMPLATES

router.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// LIST OF ALL THE ARTICLES

router.get('/', function(req, res){
	Articles.find({}, function(err, foundart){
		if (err) console.log(err);
	    else res.render('articles', {articles: foundart});	
});
});


// FORM FOR POSTING A NEW ARTICLE

router.get('/new', middlewareObj.isAdmin, function(req, res){
	res.render('newarticle');
});


// SHOWING THE ARTICLE WITH CORRESPONDING COMMENTS 

router.get("/:id", function(req, res){
	 var id = ObjectId(req.params.id.toString());
    Articles.findById(id).populate('comments').exec( function(err, obje){
    	if (err)console.log(err);
    	else {

    		res.render('show',{ article: obje, comments: obje.comments});
    		
    	}
    });
});


// EDIT FORM FOR THE ARTICLE

router.get('/:id/edit', middlewareObj.isAdmin, function(req, res){
    var id = ObjectId(req.params.id.toString());
    Articles.findById(id, function(err, obje){
    	if (err)console.log(err);
    	else {
    		res.render('edit',{article: obje});
    		
    	}
    });
});


// POSTING AN ARTICLE

router.post('/', middlewareObj.isAdmin, function(req, res){
	req.body.newart.content = req.sanitize(req.body.newart.content);
	var newart = req.body.newart;
	newart.highlight = newart.content.substring(0 , 150)+ '...';
	newart.new = 'yes';
	Articles.create(newart, function(err, obj){
		if (err) console.log(err);
		else res.redirect('/articles');
	});

});


// POSTING THE COMMENT CORRESPONDING TO THE ARTICLE

router.post('/:id/comment', middlewareObj.isLoggedIn, function(req, res){
    var id = ObjectId(req.params.id.toString());
    req.body.comment.author = req.user.username;
    Comments.create(req.body.comment, function(err, comment){
    	if (err) console.log(err);
    	else {
    		Articles.findById(id, function(err, article){
    			if (err) console.log(err);
    			else {
    				       article.comments.push(comment);
                   article.save(function(err){if (err) console.log(err)});
                   res.redirect('/articles/'+ req.params.id.toString());
    			}
    		});
    	}
    });
});

// POSTING REPLY CORRESPONDING TO AN ARTICLE

router.post('/:aid/comments/:cid/replies', function(req, res){
   Comments.findById(ObjectId(req.params.cid), function(err, comment){
     comment.replies.push({ author: req.user.username, reply: req.body.reply});
     comment.save(function(err, savedcomment){
        if (err)console.log(err);
        else res.redirect('/articles/'+ req.params.aid);
     });
   });
});


// UPDATING THE ARTICLE

router.put('/:id', middlewareObj.isAdmin, function(req, res){
    req.body.newart.content = req.sanitize (req.body.newart.content);
     newart = req.body.newart;
     newart.highlight = newart.content.substring(0, 150) + '...';
     

     var id = ObjectId(req.params.id.toString());
     Articles.updateOne({_id: id}, newart, function(err, obj){
     	if (err) console.log(err);
     	else res.redirect('/articles/' + req.params.id.toString()); 
     });
});


// DELETING THE ARTICLE

router.delete('/:id', middlewareObj.isAdmin, function(req, res){
	
	
    var id = ObjectId(req.params.id.toString());
    Articles.deleteOne({_id: id}, function(err, obj){
       if (err) console.log(err);
       else { res.redirect('/articles'); }
});

});


// DELETING THE COMMENT

router.delete('/:aid/comments/:cid', middlewareObj.checkCommentOwnership, function(req, res){
    Articles.update({_id:ObjectId(req.params.aid)},{$pull: {comments: ObjectId(req.params.cid)}}, {multi: true}, function(err, article){   
            if (err) console.log(err);
            else console.log(article);
    }); 
    Comments.deleteOne({_id: ObjectId(req.params.cid)}, function(err, comment){
      if (err) console.log(err);
      else console.log(comment);
    });
    res.redirect('/articles/' + req.params.aid);
});


module.exports = router;