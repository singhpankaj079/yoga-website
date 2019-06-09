var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	name: String,
	address: String,
	mobno: String,
	email: String,
	settings: {
		mobno_visibility: Boolean,
		address_visibility: Boolean,
		email_visibility: Boolean
	}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);