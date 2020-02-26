
// IMPORTING REQUIRED PACKAGES

var express = require('express');
var router = express.Router({mergeParams: true});
var Articles = require('./models/article');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Comments = require('./models/comment');
var middlewareObj = require('./middleware');
var multer = require('multer');
var fs = require('fs');
const Gcloud = require("@google-cloud/storage");

const gstorage =  new Gcloud.Storage({projectId: 'ashtanga-yoga-shala'});
// gstorage.projectId='ashtanga-yoga-shala';
const bucket = gstorage.bucket('ashtanga-yoga-shala');


// SETTING UP THE STORAGE FOR THE UPLOADED FILES
/*
var Storage = multer.diskStorage({
  destination: function(req, file, callback){
    callback(null, './public/images');
   },
   filename: function(req, file, callback){
    callback(null, file.originalname);
   }
});
*/
var datenow;
// MIDDLEWARE TO UPLOAD IMAGES TO GOOGLE CLOUD STORAGE

function sendUploadToGCS (req, res, next) {
  if (!req.file) {
    return next();
  }
  datenow= Date.now();
  const gcsname = datenow + req.file.originalname;
  const file = bucket.file(gcsname);

  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype
    },
    resumable: false
  });

  stream.on('error', (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on('finish', () => {
    req.file.cloudStorageObject = gcsname;
    file.makePublic().then(() => {
      req.file.cloudStoragePublicUrl = getPublicUrl(gcsname)+ "?key=AIzaSyCCgPFXD7dVfWvKF5ltT7cyxJ5dx-cmbj0";
      next();
    });
  });

  stream.end(req.file.buffer);
}


function getPublicUrl (filename) {
  return 'https://storage.googleapis.com/ashtanga-yoga-shala/' + filename;
}

var Storage = multer.memoryStorage();


// UPLOAD OBJECT (CREATING AN ARRAY)

var upload = multer({storage: Storage}).single('filetoupload');

//TO PASS 'user' OBJECT TO ALL THE EJS TEMPLATES

router.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// LIST OF ALL THE ARTICLES

router.get('/', function(req, res){
    Articles.find({}, function(err, foundart){
        if (err) console.log(err);
        else res.render('articles', {articles: foundart, metaContent: 'Yoga articles'});    
});
});


// FORM FOR POSTING A NEW ARTICLE

router.get('/new', middlewareObj.isAdmin, function(req, res){
    res.render('newarticle');
});


// EDIT FORM FOR THE ARTICLE

router.get('/:id/edit', middlewareObj.isAdmin, function(req, res){
    var id = ObjectId(req.params.id.toString());
    Articles.findById(id, function(err, obje){
        if (err)console.log(err);
        else {
            res.render('edit',{article: obje, metaContent: 'Ashtanga yoga center, bareilly | Edit article'});
            
        }
    });
});


// SHOWING THE ARTICLE WITH CORRESPONDING COMMENTS 

router.get("/:id", function(req, res){
     var id = ObjectId(req.params.id.toString());
    Articles.findById(id, function(err, found){
        if (err) console.log(err);
        else res.redirect('/articles/'+ req.params.id.toString() + '/' + found.title.replace(/ /g, "-").toLowerCase());
    })
});

// SHOWING THE ARTICLE WITH CORRESPONDING COMMENTS 

router.get("/:id/:title", function(req, res){
     var id = ObjectId(req.params.id.toString());
    Articles.findById(id).populate('comments').exec( function(err, obje){
        if (err)console.log(err);
        else {

            res.render('show',{ article: obje, comments: obje.comments, metaContent: obje.description});
            
        }
    });
});

// HIDING IMAGE FROM THE ARTICLE

router.get("/articleImage/:id/hide", function(req, res){

    Articles.updateOne({_id: ObjectId(req.params.id)}, { $set: {showImageInArticle: false}}, function(err, updated){
        if (err) console.log(err);
        else res.redirect('/articles/' + req.params.id.toString());
    });
});


// SHOWING IMAGE IN THE ARTICLE

router.get("/articleImage/:id/show", function(req, res){

    Articles.updateOne({_id: ObjectId(req.params.id)}, { $set: {showImageInArticle: true}}, function(err, updated){
        if (err) console.log(err);
        else res.redirect('/articles/' + req.params.id.toString());
    });
});


// POSTING AN ARTICLE

router.post('/', middlewareObj.isAdmin, upload, sendUploadToGCS,function(req, res){
    req.body.newart.content = req.body.newart.content;
    var newart = req.body.newart;
    newart.new = 'yes';
    if (req.file && req.cloudStoragePublicUrl){
        newart.image = getPublicUrl(datenow + req.file.originalname);
        newart.imageTitle = datenow + req.file.originalname;
        newart.showImageInArticle = true;
    } else {
        newart.showImageInArticle = false;
        newart.image = "";
        newart.imageTitle = "";
    }
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


// POSTING REPLY CORRESPONDING TO A REPLY OF AN ARTICLE

router.post('/:aid/comments/:cid/replies/:rid', middlewareObj.isLoggedIn, function(req, res){
    var reply = req.body.reply;
    Comments.findById(ObjectId(req.params.cid), function(err, comment){
        for (var i =0; i<comment.replies.length; i++ ){
            if (comment.replies[i]._id.toString() === req.params.rid){

                reply= '(@'  + comment.replies[i].author + ')' + ' ' + reply ;
                comment.replies.splice(i+1,0, {author: req.user.username, reply: reply });
                comment.save(function(err, saved){
                    if (err) console.log(err);
                    else res.redirect('/articles/'+ req.params.aid);
                });
                break;
            }
        }

    })
});


// DELETING THE REPLY 

router.delete('/:aid/comments/:cid/replies/:rid', middlewareObj.checkReplyOwnership, function(req, res){
    Comments.update({ _id: ObjectId(req.params.cid)}, { $pull : {replies: {_id: ObjectId(req.params.rid) }}}, {multi: true}, function(err, deleted){

        if (err) console.log(err);
        else res.redirect('/articles/' + req.params.aid);
    });
});


// UPDATING THE COMMENT

router.put('/:aid/comments/:cid', function(req, res){
    Comments.update({_id: ObjectId(req.params.cid)}, { $set: {text: req.body.text} }, function(err, comment){
           if (err) console.log(err);
           else res.redirect('/articles/' + req.params.aid);
    });

});


// UPDATING THE ARTICLE

router.put('/:id', middlewareObj.isAdmin,upload, sendUploadToGCS,function(req, res){
    req.body.newart.content = req.body.newart.content;
    newart = req.body.newart;
    if (req.file && req.file.cloudStoragePublicUrl){
        newart.image = getPublicUrl(datenow + req.file.originalname);
        newart.imageTitle = datenow + req.file.originalname;
        newart.showImageInArticle = true;
    } 
    
     var id = ObjectId(req.params.id.toString());
     Articles.updateOne({_id: id}, newart, function(err, obj){
        if (err) console.log(err);
        else res.redirect('/articles/' + req.params.id.toString() + '/' +  newart.title.replace(/ /g, "-").toLowerCase()); 
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


// DELETING THE ARTICLE IMAGE

router.delete('/articleImage/:id/delete', function(req, res){
    Articles.findById(req.params.id, function(err, found){
        if (err)console.log(err);
        else {
            if (found && found.imageTitle){
            var file = bucket.file(found.imageTitle);
            file.delete(function(err, apiresponse){
                if (err) console.log(err);
                else {
                    Articles.updateOne({_id: req.params.id}, {$set: {image: "", imageTitle: ""}}, function(err, deleted){
                        if (err) console.log(err);
                    });
                }
            });
        }
        }
    });
    res.redirect('/articles/');
    
});

module.exports = router;