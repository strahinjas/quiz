const express = require("express");
const passport = require("passport");
const moment = require("moment");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "./uploads/rebuses");
	},
	filename: (req, file, callback) => {
		callback(null, file.originalname);
	}
});

const upload = multer({ storage: storage });

const Anagram = require("../models/anagram");
const Hangman = require("../models/hangman");
const Term = require("../models/term");
const Goblet = require("../models/goblet");
const Evaluation = require("../models/evaluation");

const Day = require("../models/day");
const Game = require("../models/game");

const router = express.Router();

// Anagram requests

router.post("/anagram", upload.single("rebus"), passport.authenticate("jwt", { session: false }), (req, res) => {
	let anagram = new Anagram({
		riddle: req.body.riddle,
		solution: req.body.solution.toLowerCase(),
		rebus: (req.file ? "http:\\\\localhost:5000\\" + req.file.path : null),
		isRebus: req.file !== null
	});

	anagram.save((err) => {
		if (err) {
			res.json({
				success: false,
				message: "Došlo je do greške pri ažuriranju baze."
			});
		}
		else {
			res.json({
				success: true,
				message: "Anagram je uspešno dodat u bazu."
			});
		}
	});
});

router.get("/anagram/all", passport.authenticate("jwt", { session: false }), (req, res) => {
	Anagram.find().exec((err, result) => {
		if (err) throw err;

		let anagrams = [];

		for (const anagram of result) anagrams.push(anagram);

		res.json({
			success: true,
			anagrams: anagrams
		});
	});
});

router.get("/anagram/one", passport.authenticate("jwt", { session: false }), (req, res) => {
	Anagram.findById(req.query.id, (err, anagram) => {
		if (err) throw err;

		res.json({ anagram });
	});
});

router.get("/anagram/pair", passport.authenticate("jwt", { session: false }), (req, res) => {
	Anagram.countDocuments().exec((err, count) => {
		if (err) throw err;

		let previous;
		let anagramPair = [];

		for (let i = 0; i < 2; i++) {
			let random = Math.floor(Math.random() * count);
			while (random === previous) random = Math.floor(Math.random() * count);
			previous = random;

			Anagram.findOne().skip(random).exec((err, anagram) => {
				if (err) throw err;

				anagramPair.push(anagram);

				if (anagramPair.length === 2) res.json({
					success: true,
					pair: anagramPair
				});
			});
		}
	});
});

// Hangman requests

router.post("/hangman", passport.authenticate("jwt", { session: false }), (req, res) => {
	let hangman = new Hangman({ word: req.body.word.toLowerCase() });

	hangman.save((err) => {
		if (err) {
			res.json({
				success: false,
				message: "Došlo je do greške pri ažuriranju baze."
			});
		}
		else {
			res.json({
				success: true,
				message: "Reč za igru vešala je uspešno dodata u bazu."
			});
		}
	});
});

router.get("/hangman", passport.authenticate("jwt", { session: false }), (req, res) => {
	Hangman.countDocuments().exec((err, count) => {
		if (err) throw err;

		let previous;
		let hangmanPair = [];

		for (let i = 0; i < 2; i++) {
			let random = Math.floor(Math.random() * count);
			while (random === previous) random = Math.floor(Math.random() * count);
			previous = random;

			Hangman.findOne().skip(random).exec((err, hangman) => {
				if (err) throw err;

				hangmanPair.push({ word: hangman.word });

				if (hangmanPair.length === 2) res.json({
					success: true,
					pair: hangmanPair
				});
			});
		}
	});
});

// Geography terms requests

router.post("/term/store", passport.authenticate("jwt", { session: false }), (req, res) => {
	let term = new Term({
		category: req.body.category,
		term: req.body.term
	});

	term.save((err) => {
		if (err) {
			res.json({
				success: false,
				message: "Došlo je do greške pri ažuriranju baze."
			});
		}
	});

	res.json({
		success: true,
		message: "Pojmovi su uspešno dodati u bazu."
	});
});

router.post("/term/check", passport.authenticate("jwt", { session: false }), (req, res) => {
	const terms = req.body.terms;
	const id = req.body.id;

	let points = 0;
	let possiblePoints = 0;
	let counter = 0;

	let missingTerms = [];

	for (let term of terms) {
		Term.findOne({ category: term.category, term: term.term }, (err, result) => {
			if (err) throw err;

			if (result) points += 2;
			else if (term.term !== '') {
				possiblePoints += 4;
				missingTerms.push(term);
			}

			if (++counter === terms.length) {
				if (missingTerms.length > 0) {
					let evaluation = new Evaluation({
						game: id,
						terms: missingTerms
					});

					evaluation.save();
				}

				res.json({ points, possiblePoints });
			}
		});
	}
});

router.get("/eval", passport.authenticate("jwt", { session: false }), (req, res) => {
	Evaluation.find((err, evals) => {
		if (err) throw err;

		res.json({ evals });
	});
});

router.delete("/eval", passport.authenticate("jwt", { session: false }), (req, res) => {
	Evaluation.deleteOne({ _id: req.query.id }, (err) => {
		if (err) throw err;

		res.json({ success: true });
	});
});

// Goblet requests

router.post("/goblet", passport.authenticate("jwt", { session: false }), (req, res) => {
	let goblet = new Goblet({ rows: req.body.rows });

	goblet.save((err) => {
		if (err) {
			res.json({
				success: false,
				message: "Došlo je do greške pri ažuriranju baze."
			});
		}
		else {
			res.json({
				success: true,
				message: "Pehar je uspešno dodat u bazu."
			});
		}
	});
});

router.get("/goblet/all", passport.authenticate("jwt", { session: false }), (req, res) => {
	Goblet.find().exec((err, result) => {
		if (err) throw err;

		let goblets = [];

		for (const document of result) {
			let goblet = [];

			for (const row of document.rows) {
				goblet.push({ question: row.question, answer: row.answer });
			}

			goblets.push({ _id: document._id.valueOf(), rows: goblet });
		}

		res.json({
			success: true,
			goblets: goblets
		})
	});
});

router.get("/goblet/one", passport.authenticate("jwt", { session: false }), (req, res) => {
	Goblet.findById(req.query.id, (err, goblet) => {
		if (err) throw err;

		res.json({ goblet });
	});
});

router.get("/goblet/pair", passport.authenticate("jwt", { session: false }), (req, res) => {
	Goblet.countDocuments().exec((err, count) => {
		if (err) throw err;

		let previous;
		let gobletPair = [];

		for (let i = 0; i < 2; i++) {
			let random = Math.floor(Math.random() * count);
			while (random === previous) random = Math.floor(Math.random() * count);
			previous = random;

			Goblet.findOne().skip(random).exec((err, goblet) => {
				if (err) throw err;

				gobletPair.push(goblet);
				if (gobletPair.length === 2) res.json({
					success: true,
					pair: gobletPair
				});
			});
		}
	});
});

// Game of the Day

router.post("/day/store", passport.authenticate("jwt", { session: false }), (req, res) => {
	let date = moment(req.body.date).startOf("day");

	Day.findOne({ date: { $gte: date.toDate(), $lt: moment(date).endOf('day').toDate() } }, (err, game) => {
		if (err) throw err;

		if (game) {
			if (game.played) {
				res.json({
					success: false,
					message: "Igra dana za taj dan je već odigrana i ne može se menjati."
				});
			}
			else {
				game.anagram = req.body.anagram;
				game.goblet = req.body.goblet;

				game.save((err) => {
					if (err) {
						res.json({
							success: false,
							message: "Došlo je do greške pri ažuriranju baze."
						});
					}
					else {
						res.json({
							success: true,
							message: "Igra dana je uspešno ažurirana."
						});
					}
				});
			}
		}
		else {
			let game = new Day({
				date: req.body.date,
				anagram: req.body.anagram,
				goblet: req.body.goblet
			});

			game.save((err) => {
				if (err) {
					res.json({
						success: false,
						message: "Došlo je do greške pri ažuriranju baze."
					});
				}
				else {
					res.json({
						success: true,
						message: "Igra dana je uspešno sačuvana u bazi."
					});
				}
			})
		}
	});
});

router.post("/day/play", passport.authenticate("jwt", { session: false }), (req, res) => {
	let date = moment(req.body.date).startOf("day");

	Game.findOne({
		date: { $gte: date.toDate(), $lt: moment(date).endOf('day').toDate() },
		player: req.body.username
	}, (err, game) => {
		if (err) throw err;

		if (game) {
			res.json({
				success: false,
				message: "Već ste odigrali igru dana za danas."
			});
		}
		else {
			Day.findOne({ date: { $gte: date.toDate(), $lt: moment(date).endOf('day').toDate() } }, (err, day) => {
				if (err) throw err;

				if (day) {
					let game = new Game({
						date: day.date,
						player: req.body.username
					});

					game.save((err) => {
						if (err) {
							res.json({
								success: false,
								message: "Došlo je do greške pri ažuriranju baze."
							});
						}
						else {
							day.played = true;
							day.save();

							res.json({
								success: true,
								message: "Igra dana počinje.",
								game: game,
								anagram: day.anagram,
								goblet: day.goblet
							});
						}
					});
				}
				else {
					res.json({
						success: false,
						message: "Izvinite, administrator još nije definisao igru dana za danas."
					});
				}
			});
		}
	});
});

router.post("/day/update", passport.authenticate("jwt", { session: false }), (req, res) => {
	Game.updateOne({ _id: req.body._id }, { $set: { points: req.body.points } }, (err, result) => {
		if (err) throw err;

		res.json({
			success: result.nModified > 0
		});
	});
});

router.get("/day/ranks", passport.authenticate("jwt", { session: false }), (req, res) => {
	let now = moment();
	let username = req.query.username;

	Game.find({ date: { $gte: now.startOf("day").toDate(), $lt: now.endOf("day").toDate() } })
		.sort({ points: -1 })
		.exec((err, result) => {
			if (err) throw err;

			let ranks = [];

			if (result.length > 0) {
				let found = false;
				let limit = result.length > 10 ? 10 : result.length;

				for (let i = 0; i < limit; i++) {
					ranks.push(result[i]);
					if (result[i].player === username) found = true;
				}

				if (!found) {
					let playerResult = result[result.map(e => { return e.player }).indexOf(username)];
					if (playerResult) ranks.push(playerResult);
				}
			}

			res.json(ranks);
		}
	);
});

module.exports = router;