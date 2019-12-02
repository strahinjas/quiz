const mongoose = require("mongoose");

const termSchema = mongoose.Schema({
	category: String,
	term: String
});

const Term = mongoose.model("Term", termSchema);

module.exports = Term;