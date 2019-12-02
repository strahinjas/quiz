const mongoose = require("mongoose");

const hangmanSchema = mongoose.Schema({
	word: String
});

const Hangman = mongoose.model("Hangman", hangmanSchema, "hangmen");

module.exports = Hangman;