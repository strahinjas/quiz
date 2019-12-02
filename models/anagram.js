const mongoose = require("mongoose");

const anagramSchema = mongoose.Schema({
	riddle: String,
	solution: String,
	rebus: String,
	isRebus: Boolean
});

const Anagram = mongoose.model("Anagram", anagramSchema);

module.exports = Anagram;