// INCLUDING REQUIRD PACKAGE
var mongoose = require('mongoose');


// DEFINING IMAGE SCHEMA

var imageSchema = new mongoose.Schema({
	title: String,
	url: String,
	visibility: Boolean,
	slideshow: Boolean,
	description: String
});


// COMPILING IMAGE SCHEMA INTO THE MODEL

var Images = mongoose.model('Image', imageSchema);


// EXPORTING THE MODEL

module.exports = Images;