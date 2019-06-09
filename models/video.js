var mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
	title: String,
	src: String
});

module.exports = mongoose.model('Video', videoSchema);