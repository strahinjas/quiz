const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const requestSchema = mongoose.Schema({
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

const Request = mongoose.model("Request", requestSchema);

const saltRounds = 10;

module.exports = Request;

module.exports.save = function(request, callback) {
	bcrypt.hash(request.password, saltRounds, (err, hash) => {
		if (err) throw err;

		request.password = hash;
		bcrypt.hash(request.answer, saltRounds, (err, hash) => {
			if (err) throw err;

			request.answer = hash;
			request.save(callback);
		});
	});
};