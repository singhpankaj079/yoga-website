
// IMPORTING REQUIRED PACKAGES

var express = require('express');
var router = express.Router({mergeParamas: true});
var passport = require('passport');
var Articles = require('./models/article');
var Videos = require('./models/video');
var Joinrequests = require('./models/joinrequest');
var Faqs = require('./models/faq');
var Videos = require('./models/video');
var Users = require('./models/user');
var Images = require('./models/image');
var middlewareObj = require('./middleware');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var multer = require('multer');
var fs = require('fs');
const Gcloud = require("@google-cloud/storage");
var request = require('request');
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


// TO PASS 'user' OBJECT TO ALL THE EJS TEMPLATES

router.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


// HOMEPAGE

router.get('/', function(req, res) {
    Videos.find({}, function(err, videos){
  if (err)console.log(err);
  else {
      Articles.find({}, function(err, articles){
      if (err) console.log(err);
      else {
        Images.find({slideshow: true}, function(err, images){
      if (err) console.log(err);
      else res.render('homepage', { articles: articles, images: images, videos: videos});
   });
  
}
  });
   } 
});
});


// ASHTANGA YOGA

router.get('/ashtanga', function(req, res) {
    
  Articles.find({}, function(err, articles){
    if (err) console.log(err);
    else res.render('ashtanga', {articles: articles, metaContent: 'Ashtanga yoga'});
  });
   
});


// POWER YOGA

router.get('/poweryoga', function(req, res) {
    
  Articles.find({}, function(err, articles){
    if (err) console.log(err);
    else res.render('poweryoga', {articles: articles, metaContent: 'Power yoga'});
  });
   
});


// TRADITIONAL YOGA

router.get('/traditional', function(req, res){
 Articles.find({}, function(err, articles){
    if (err) console.log(err);
    else res.render('traditional', {articles: articles, metaContent: 'Traditional yoga'});
  });
})


// VIDEOS

router.get('/videos', function(req, res){
  Videos.find({}, function(err, videos){
  if (err)console.log(err);
  res.render('videos', {videos: videos, metaContent: 'Yoga videos'});
  });
});


// FETCH VIDEOS FROM YOUTUBE

router.get('/videos/fetch', function(req, res){
  request("https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&channelId=UCpRVMZKYCPRJilBmEg-Ak8w&order=viewCount&key=AIzaSyCCgPFXD7dVfWvKF5ltT7cyxJ5dx-cmbj0",{json:true},(err, res, body)=>{
    var items  = body.items;
    Videos.deleteMany({}, function(err, deleted){
      if (err)console.log(err);
    });
    var videos = [];
    for (let i = 0;i<items.length;i++){
        videos.push({ title: items[i].snippet.title, src: "https://youtube.com/embed/" + items[i].id.videoId, channelTitle: items[i].snippet.channelTitle});
    }
    Videos.insertMany(videos, function(err, inserted){
      if (err) console.log(err);
      
    });
    
  });
  res.redirect('/videos');
});

// FORM FOR JOINING THE CENTER

router.get('/join', middlewareObj.isLoggedIn, function(req, res){
    res.render('form', { metaContent: 'Form'});
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


// ABOUT OUR CENTER

router.get('/ourcenter', function(req, res){
  res.render('ourcenter', { metaContent: 'Ashtanga yoga center, bareilly'});
});


// ABOUT OUR TEACHER

router.get('/ourteacher', function(req, res){
  res.render('ourteacher', { metaContent: 'Ashtanga yoga center, bareilly | Our Teacher'});
});

// IMAGES

router.get('/images', function(req, res){
   Images.find({}, function(err, images){
    if (err) console.log(err);
    else res.render('images', {images: images, metaContent: 'Yoga Images'});
   });
});


// REMOVING A IMAGE FROM SLIDESHOW LIST

router.get('/images/:id/toggleslideshow', middlewareObj.isAdmin, function(req, res){
   Images.findById(ObjectId(req.params.id),function(err, found){
       if (err) console.log(err);
       else { 
       found.slideshow = !found.slideshow;
         found.save(function(err, saved){
          if (err) console.log(err);
          else {  req.flash("success", "Successfully changed slideshow visibility");res.redirect("/images");}
         
         });
        }
       
   });
});

// CHANGING IMAGE VISIBILITY TO OTHER USERS

router.get('/images/:id/togglevisibility', middlewareObj.isAdmin, function(req, res){
   Images.findById(ObjectId(req.params.id),function(err, found){
       if (err) console.log(err);
       else { 
       found.visibility = !found.visibility;
         found.save(function(err, saved){
          if (err) console.log(err);
          else {  req.flash("success", "Successfully changed image visibility");res.redirect("/images");}
         
         });
        }
       
   });
});

// SENDING robots.txt FILE

router.get('/robots.txt', function(req, res){
  res.sendFile(__dirname + "/robots.txt");
})
// SUBMITTING THE JOIN FORM

router.post('/join', middlewareObj.isLoggedIn, function(req, res){

   var request = req.body.request;
   request.date = new Date().toString();
   Users.findOne({username: req.user.username}, function(err, user){
    if (err) console.log(err);
    else {
        user.email= request.email;
        user.save(function(err, saved){
          if (err) console.log(err);
        });
    }
      });

   request.username = req.user.username;
     Joinrequests.create(request, function(err){
        if (err) console.log(err);
    });
     req.flash('success','Join request successfully submitted!!');
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


// ADDING A FAQ

router.post('/faqs', middlewareObj.isAdmin, function(req, res){
  var faq = req.body.faq;
  Faqs.create(faq, function(err, added){
    if (err) console.log(err);
    else res.redirect('/faqs');
  });
});


// UPLOADING IMAGES

router.post('/images', middlewareObj.isAdmin, upload, sendUploadToGCS, function(req, res){
      if (req.file && req.file.cloudStoragePublicUrl){
         var image = { title: datenow + req.file.originalname, url: getPublicUrl(datenow + req.file.originalname)};
      image.visibility=true;
      image.slideshow =true;
      image.description = req.body.description;
      //console.log(req);
      Images.create(image, function(err, saved){
        if (err) res.send('Something went wrong');
      });

      req.flash('success', 'file uploaded successfully!!');
      res.redirect('/images');
      }
    else {
      res.send('Something went wrong');
    }
  
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

// DELETING A JOIN REQUESTS

router.delete('/joinrequests/:id', middlewareObj.isAdmin, function(req, res){
  Joinrequests.deleteOne({ _id: ObjectId(req.params.id) }, function(err, deleted){
    if (err) console.log(err);
    else {
        res.redirect('/joinrequests');
    }
  })
});


// DELETING A FAQ

router.delete('/faqs/:id', middlewareObj.isAdmin, function(req, res){
   Faqs.deleteOne({_id: ObjectId(req.params.id)}, function(err, deleted){
    if (err) console.log(err);
    else res.redirect('/faqs');
   });
});

// DELETING UPLOADED IMAGE

router.delete('/images/:id', middlewareObj.isAdmin, function(req, res){
   Images.findById(req.params.id, function(err, image){
    if (err) console.log(err);
    const file = bucket.file(image.title);
    file.delete(function(err, apiresponse){
      if (err) console.log(err);
    });
    
});
    Images.deleteOne({ _id: ObjectId(req.params.id) }, function(err, deleted){
      if (err) console.log(err);
      else {
        req.flash('success', 'Successfully deleted!!');
        res.redirect('/images');
      }
    });
});

module.exports = router;