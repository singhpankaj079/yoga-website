
var mongoose = require('mongoose');
var joinSchema = new mongoose.Schema({
	username: String,
	name: String,
	mobno: String,
	email: String,
	address: String,
	purpose: String,
	date: String,
	time: String,
	style: String
});

module.exports = mongoose.model('Joinrequest', joinSchema);