var mongoose = require('mongoose');
var articleSchema = new mongoose.Schema({
	title: String,
	href: String,  // it is only for those articles which are not new i.e it is for those articles which has been created by the owner
	description: String,
	image: String,
	imageTitle: String,
	highlight: String,
	content: String,
	showImageInArticle: Boolean,
	new: String,//tells whether the articles is contributed by one of the users or not
    comments: [ {
    	           type: mongoose.Schema.Types.ObjectId,
    	           ref: 'Comment'

                 }  
               ]
});


module.exports = mongoose.model("Article", articleSchema);