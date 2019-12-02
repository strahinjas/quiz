const express = require("express");
const passport = require("passport");
const moment = require("moment");

const Game = require("../models/game");
const Match = require("../models/match");

const router = express.Router();

router.get("/player", passport.authenticate("jwt", { session: false }), (req, res) => {
	const username = req.query.username;

	Match.find({ $or: [{ blue: username }, { red: username }] }, (err, result) => {
		if (err) throw err;

		res.json(result);
	});
});

router.get("/twenty_days", (req, res) => {
	let now = moment().endOf("day").toDate();
	let limit = moment().subtract(20, "days").startOf("day").toDate();

	let points = {};

	const extract = function(points) {
		let sorted = [];
		for (const player in points) sorted.push({
			player: player,
			points: points[player]
		});
		sorted.sort((a, b) => b.points - a.points);
		return sorted.slice(0, 10);
	};

	Game.aggregate()
		.match({ date: { $gte: limit, $lt: now } })
		.group({ _id: "$player", totalPoints: { $sum: "$points" } })
		.exec((err, result) => {
			if (err) throw err;

			if (result) {
				for (const record of result) points[record._id] = record.totalPoints;

				Match.aggregate()
					.match({ date: { $gte: limit, $lt: now } })
					.group({ _id: "$blue", totalPoints: { $sum: "$bluePoints" } })
					.exec((err, result) => {
						if (err) throw err;

						if (result) {
							for (const record of result) {
								if (Object.keys(points).includes(record._id)) {
									points[record._id] += record.totalPoints;
								}
								else {
									points[record._id] = record.totalPoints;
								}
							}

							Match.aggregate()
								.match({ date: { $gte: limit, $lt: now } })
								.group({ _id: "$red", totalPoints: { $sum: "$redPoints" } })
								.exec((err, result) => {
									if (err) throw err;

									if (result) {
										for (const record of result) {
											if (Object.keys(points).includes(record._id)) {
												points[record._id] += record.totalPoints;
											}
											else {
												points[record._id] = record.totalPoints;
											}
										}
										res.json(extract(points));
									}
									else res.json(extract(points));
								}
							);
						}
						else res.json(extract(points));
					}
				);
			}
			else res.json(extract(points));
		}
	);
});

router.get("/month", (req, res) => {
	let now = moment().endOf("day").toDate();
	let limit = moment().startOf("month").toDate();

	let points = {};

	const extract = function(points) {
		let sorted = [];
		for (const player in points) sorted.push({
			player: player,
			points: points[player]
		});
		sorted.sort((a, b) => b.points - a.points);
		return sorted.slice(0, 10);
	};

	Game.aggregate()
		.match({ date: { $gte: limit, $lt: now } })
		.group({ _id: "$player", totalPoints: { $sum: "$points" } })
		.exec((err, result) => {
			if (err) throw err;

			if (result) {
				for (const record of result) points[record._id] = record.totalPoints;

				Match.aggregate()
					.match({ date: { $gte: limit, $lt: now } })
					.group({ _id: "$blue", totalPoints: { $sum: "$bluePoints" } })
					.exec((err, result) => {
						if (err) throw err;

						if (result) {
							for (const record of result) {
								if (Object.keys(points).includes(record._id)) {
									points[record._id] += record.totalPoints;
								}
								else {
									points[record._id] = record.totalPoints;
								}
							}

							Match.aggregate()
								.match({ date: { $gte: limit, $lt: now } })
								.group({ _id: "$red", totalPoints: { $sum: "$redPoints" } })
								.exec((err, result) => {
									if (err) throw err;

									if (result) {
										for (const record of result) {
											if (Object.keys(points).includes(record._id)) {
												points[record._id] += record.totalPoints;
											}
											else {
												points[record._id] = record.totalPoints;
											}
										}
										res.json(extract(points));
									}
									else res.json(extract(points));
								}
							);
						}
						else res.json(extract(points));
					}
				);
			}
			else res.json(extract(points));
		}
	);
});

router.get("/available", passport.authenticate("jwt", { session: false }), (req, res) => {
	Match.countDocuments({ started: false }, (err, count) => {
		if (err) throw err;

		res.json(count);
	});
});

router.post("/update", passport.authenticate("jwt", { session: false }), (req, res) => {
	Match.updateOne({ _id: req.body._id }, {
		$set: {
			bluePoints: req.body.bluePoints,
			redPoints: req.body.redPoints,
			outcome: req.body.outcome
		}
	}, (err, result) => {
		if (err) throw err;

		res.json({
			success: result.nModified > 0
		});
	});
});

module.exports = router;