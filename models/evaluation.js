const mongoose = require("mongoose");

const evaluationSchema = mongoose.Schema({
	game: String,
	terms: [{ category: String, term: String }]
});

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

module.exports = Evaluation;