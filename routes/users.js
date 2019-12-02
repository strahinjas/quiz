const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "./uploads/profile_pictures");
	},
	filename: (req, file, callback) => {
		callback(null, req.body.username + "." + file.originalname.split(".").pop());
	}
});

const upload = multer({ storage: storage });

const Request = require("../models/request");
const User = require("../models/user");
const config = require("../config/database");

const router = express.Router();

router.post("/request", upload.single("picture"), (req, res) => {
	let request = new Request({
		name: req.body.name,
		surname: req.body.surname,
		email: req.body.email,
		profession: req.body.profession,
		role: req.body.role,
		username: req.body.username,
		password: req.body.password,
		gender: req.body.gender,
		jmbg: req.body.jmbg,
		picture: (req.file ? "http:\\\\localhost:5000\\" + req.file.path : null),
		question: req.body.question,
		answer: req.body.answer
	});

	User.exists({ username: request.username }, (err, found) => {
		if (err) throw err;

		if (found) {
			res.json({
				success: false,
				message: "Korisnik sa datim korisničkim imenom već postoji u bazi."
			});
		}
		else {
			Request.save(request, (err) => {
				if (err) {
					res.json({
						success: false,
						message: "Došlo je do greške pri slanju zahteva."
					});
				}
				else {
					res.json({
						success: true,
						message: "Zahtev za registracijom je uspešno poslat."
					});
				}
			});
		}
	});
});

router.get("/request", (req, res) => {
	Request.find().exec((err, requests) => {
		if (err) throw err;

		res.json({ requests: requests });
	});
});

router.post("/register", passport.authenticate("jwt", { session: false }), (req, res) => {
	const request = req.body.request;
	const accepted = req.body.accepted;

	if (accepted) {
		let user = new User({
			name: request.name,
			surname: request.surname,
			email: request.email,
			profession: request.profession,
			role: request.role,
			username: request.username,
			password: request.password,
			gender: request.gender,
			jmbg: request.jmbg,
			picture: request.picture,
			question: request.question,
			answer: request.answer
		});

		user.save((err) => {
			if (err) throw err;

			res.json({
				success: true,
				message: "Korisnik je uspešno registrovan."
			});
		});
	}
	else {
		res.json({
			success: true,
			message: "Zahtev je odbijen."
		});
	}

	Request.deleteOne({ username: request.username }, (err) => {
		if (err) throw err;
	});
});

router.post("/authenticate", (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	User.findOne({ username: username }, (err, user) => {
		if (err) throw err;

		if (!user) return res.json({
			success: false,
			message: "Ne postoji korisnik sa datim korisničkim imenom."
		});

		User.checkPassword(password, user.password, (err, matched) => {
			if (err) throw err;

			if (matched) {
				const token = jwt.sign({ id: user._id }, config.secret, {
					expiresIn: "2 hours"
				});

				res.json({
					success: true,
					token: "JWT " + token,
					role: user.role
				});
			}
			else {
				res.json({
					success: false,
					message: "Pogrešna lozinka."
				});
			}
		});
	});
});

router.post("/question", (req, res) => {
	const username = req.body.username;
	const jmbg = req.body.jmbg;

	User.findOne({ username: username }, (err, user) => {
		if (err) throw err;

		if (!user) return res.json({
			success: false,
			message: "Ne postoji korisnik sa datim korisničkim imenom."
		});

		if (jmbg === user.jmbg) {
			res.json({
				success: true,
				message: "Odgovorite na Vaše sigurnosno pitanje.",
				question: user.question,
				answer: user.answer
			});
		}
		else {
			res.json({
				success: false,
				message: "Korisničko ime i JMBG se ne poklapaju."
			});
		}
	});
});

router.post("/answer", (req, res) => {
	const username = req.body.username;
	const answer = req.body.answer;

	User.findOne({ username: username }, (err, user) => {
		if (err) throw err;

		User.checkAnswer(answer, user.answer, (err, matched) => {
			if (err) throw err;

			if (matched) {
				res.json({
					success: true,
					message: "Unesite vašu novu lozinku."
				});
			}
			else {
				res.json({
					success: false,
					message: "Uneli ste pogrešan odgovor."
				});
			}
		});
	});
});

router.post("/password-change", (req, res) => {
	const username = req.body.username;
	const oldPassword = req.body.oldPassword;
	const password = req.body.password;

	User.findOne({ username: username }, (err, user) => {
		if (err) throw err;

		if (!user) return res.json({
			success: false,
			message: "Ne postoji korisnik sa datim korisničkim imenom."
		});

		if (oldPassword) {
			User.checkPassword(password, user.password, (err, matched) => {
				if (err) throw err;

				if (!matched) return res.json({
					success: false,
					message: "Pogrešna lozinka."
				});

				User.changePassword(user, password, (err, result) => {
					if (err) throw err;
		
					if (result.nModified === 1) {
						res.json({
							success: true,
							message: "Vaša lozinka je uspešno promenjena."
						});
					}
					else {
						res.json({
							success: false,
							message: "Došlo je do greške pri ažuriranju baze."
						});
					}
				});
			});
		}
		else {
			User.changePassword(user, password, (err, result) => {
				if (err) throw err;
	
				if (result.nModified === 1) {
					res.json({
						success: true,
						message: "Vaša lozinka je uspešno promenjena."
					});
				}
				else {
					res.json({
						success: false,
						message: "Došlo je do greške pri ažuriranju baze."
					});
				}
			});
		}
	});
});

router.get("/profile", passport.authenticate("jwt", { session: false }), (req, res) => {
	res.json({ user: req.user });
});

module.exports = router;