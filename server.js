const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");

const config = require("./config/database");

const users = require("./routes/users");
const games = require("./routes/games");
const matches = require("./routes/matches");

const Match = require("./models/match");

const app = express();

app.use(express.static(path.join(__dirname, "client/dist/client")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;

mongoose.connect(config.database, { useNewUrlParser: true }, (err) => {
	if (err) console.error(`Database error: ${err}`);
	else console.log(`Connected to database ${config.database}`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

require("./config/passport")(passport);

app.use("/users", users);
app.use("/games", games);
app.use("/matches", matches);

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, 'client/dist/client/index.html'));
});

const server = require("http").Server(app);
const io = require("socket.io")(server);

io.of("/supervisor").on("connection", socket => {
	let previousGameID;
	const safeJoin = gameID => {
		socket.leave(previousGameID);
		socket.join(gameID);
		previousGameID = gameID;
	};

	socket.on("getEvaluation", gameID => {
		if (previousGameID !== gameID) safeJoin(gameID);
	});

	socket.on("evaluated", (gameID, points) => {
		socket.to(gameID).emit("evaluated", points);
	});
});

io.of("/multiplayer").on("connection", socket => {
	let previousMatchID;
	const safeJoin = matchID => {
		socket.leave(previousMatchID);
		socket.join(matchID);
		previousMatchID = matchID;
	}

	// Match Creation

	socket.on("create", username => {
		let match = new Match({
			date: new Date(),
			blue: username
		});

		match.save((err, product) => {
			if (err) throw err;

			safeJoin(product._id);
		});
	});

	socket.on("cancel", username => {
		Match.deleteOne({ blue: username, started: false }, (err) => {
			if (err) throw err;
		});
	});

	socket.on("join", username => {
		Match.findOne({ started: false }, (err, match) => {
			if (err) throw err;

			match.red = username;
			match.started = true;
			match.save();

			safeJoin(match._id);
			socket.to(match._id).emit("joined", match);
			socket.emit("joined", match);
		});
	});

	// Anagram

	socket.on("anagrams", anagrams => {
		socket.to(previousMatchID).emit("anagrams", anagrams);
	});

	socket.on("blueAnagram", correct => {
		socket.to(previousMatchID).emit("blueAnagram", correct);
	});

	socket.on("redAnagram", correct => {
		socket.to(previousMatchID).emit("redAnagram", correct);
	});

	// My Number

	socket.on("numbers", data => {
		socket.to(previousMatchID).emit("numbers", data);
	});

	socket.on("redResult", data => {
		socket.to(previousMatchID).emit("redResult", data);
	});

	socket.on("points", data => {
		socket.to(previousMatchID).emit("points", data);
	});

	// Hangman

	socket.on("hangmen", data => {
		socket.to(previousMatchID).emit("hangmen", data);
	});

	socket.on("hangmanLetter", data => {
		socket.to(previousMatchID).emit("hangmanLetter", data);
	});

	// Geography

	socket.on("letter", data => {
		socket.to(previousMatchID).emit("letter", data);
	});

	socket.on("terms", data => {
		socket.to(previousMatchID).emit("terms", data);
	});

	socket.on("missingTerms", data => {
		socket.to(previousMatchID).emit("missingTerms", data);
	});

	socket.on("nextRound", data => {
		socket.to(previousMatchID).emit("nextRound", data);
	});

	socket.on("bluePoints", data => {
		socket.to(previousMatchID).emit("bluePoints", data);
	});

	socket.on("redPoints", data => {
		socket.to(previousMatchID).emit("redPoints", data);
	});

	// Goblet

	socket.on("goblets", data => {
		socket.to(previousMatchID).emit("goblets", data);
	});

	socket.on("answer", data => {
		socket.to(previousMatchID).emit("answer", data);
	});
});

server.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});