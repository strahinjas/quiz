const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const User = require("../models/user");
const config = require("./database");

module.exports = function(passport) {
	let options = {};
	options.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
	options.secretOrKey = config.secret;
	passport.use(new JwtStrategy(options, (jwt_payload, done) => {
		User.findById(jwt_payload.id, (err, user) => {
			if (err) return done(err, false);

			if (user) return done(null, user);
			else return done(null, false);
		});
	}));
};