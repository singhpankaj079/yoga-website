var mongoose = require('mongoose');
var faqSchema = new mongoose.Schema({
	question: String,
	answer: String
});

var faqs = mongoose.model('faq', faqSchema);

module.exports = faqs;