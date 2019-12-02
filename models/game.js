const mongoose = require("mongoose");

const gameSchema = mongoose.Schema({
	date: Date,
	player: String,
	points: { type: Number, default: 0 }
});

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;