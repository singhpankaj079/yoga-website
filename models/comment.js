var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
	text: String,
	author: String,
	replies: [{ 
		author: String,
        reply: String,
        }]
});

module.exports = mongoose.model('Comment', commentSchema);