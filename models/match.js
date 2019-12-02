const mongoose = require("mongoose");

const matchSchema = mongoose.Schema({
	date: Date,
	blue: String,
	bluePoints: {
		type: Number,
		default: 0
	},
	red: {
		type: String,
		default: ""
	},
	redPoints: {
		type: Number,
		default: 0
	},
	outcome: {
		type: String,
		default: "draw"
	},
	started: {
		type: Boolean,
		default: false
	}
});

const Match = mongoose.model("Match", matchSchema, "matches");

module.exports = Match;