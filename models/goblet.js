const mongoose = require("mongoose");

const gobletSchema = mongoose.Schema({
	rows: [{ question: String, answer: String }]
});

const Goblet = mongoose.model("Goblet", gobletSchema);

module.exports = Goblet;