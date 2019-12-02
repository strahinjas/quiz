const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	surname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	profession: {
		type: String
	},
	role: {
		type: String
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	gender: {
		type: String,
		required: true
	},
	jmbg: {
		type: String,
		required: true
	},
	picture: {
		type: String
	},
	question: {
		type: String,
		required: true
	},
	answer: {
		type: String,
		required: true
	}
});

const User = mongoose.model("User", userSchema);

const saltRounds = 10;

module.exports = User;

module.exports.checkAnswer = function(answer, hash, callback) {
	bcrypt.compare(answer, hash, (err, matched) => {
		if (err) throw err;
		callback(null, matched);
	});
}

module.exports.checkPassword = function(password, hash, callback) {
	bcrypt.compare(password, hash, (err, matched) => {
		if (err) throw err;
		callback(null, matched);
	});
};

module.exports.changePassword = function(user, password, callback) {
	bcrypt.hash(password, saltRounds, (err, hash) => {
		if (err) throw err;

		User.updateOne({ username: user.username }, { $set: { password: hash } }, callback);
	});
};