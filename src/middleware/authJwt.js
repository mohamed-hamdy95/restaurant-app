const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

verifyToken = (req, res, next) => {
	let token = req.headers["authorization"];
	if (!token) {
		return res.status(403).send({
			message: "No token provided!",
		});
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			return res.status(401).send({
				message: "Unauthorized!",
			});
		}
		req.userId = decoded.id;
		next();
	});
};

isAdmin = (req, res, next) => {
	User.findByPk(req.userId).then((user) => {
		user.getRoles().then((roles) => {
			for (let i = 0; i < roles.length; i++) {
				if (roles[i].name === "admin") {
					next();
					return;
				}
			}

			res.status(403).send({
				message: "Require Admin Role!",
			});
			return;
		});
	});
};

isEmployeeOrAdmin = (req, res, next) => {
	User.findByPk(req.userId).then((user) => {
		user.getRoles().then((roles) => {
			for (let i = 0; i < roles.length; i++) {
				if (roles[i].name === "employee") {
					next();
					return;
				}

				if (roles[i].name === "admin") {
					next();
					return;
				}
			}

			res.status(403).send({
				message: "Require Employee or Admin Role!",
			});
		});
	});
};

const authJwt = {
	verifyToken: verifyToken,
	isAdmin: isAdmin,
	isEmployeeOrAdmin: isEmployeeOrAdmin,
};
module.exports = authJwt;
