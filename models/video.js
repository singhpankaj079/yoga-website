var mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
	title: String,
	src: String,
	channelTitle: String
});

module.exports = mongoose.model('Video', videoSchema);