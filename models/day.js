const mongoose = require("mongoose");

const daySchema = mongoose.Schema({
	date: Date,
	anagram: String,
	goblet: String,
	played: { type: Boolean, default: false }
});

const Day = mongoose.model("Day", daySchema);

module.exports = Day;