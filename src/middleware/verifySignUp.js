const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateNumber = (req, res, next) => {
	// Employee Number
	const number = String(req.body.number);
	if (number) {
		if (String(number).length == 4 && !isNaN(number)) {
			User.findOne({
				where: {
					number,
				},
			}).then((user) => {
				if (user) {
					res.status(400).send({
						message: "Failed! Employee Number is already in use!",
					});
					return;
				}
				next();
			});
		} else {
			res.status(400).send({ message: "Failed! Employee Number Must be exactly 4 digits." });
			return;
		}
	} else {
		res.status(400).send({ message: "Please Specify User Number." });
		return;
	}
};

checkRolesExisted = (req, res, next) => {
	if (req.body.roles) {
		for (let i = 0; i < req.body.roles.length; i++) {
			if (!ROLES.includes(req.body.roles[i])) {
				res.status(400).send({
					message: "Failed! Role does not exist = " + req.body.roles[i],
				});
				return;
			}
		}
	} else {
		res.status(400).send({ message: "Please Specify User Roles Ex, 'roles': ['admin'] or ['employee']." });
		return;
	}

	next();
};

checkPasswordStrength = (req, res, next) => {
	if (req.body.password) {
		if (req.body.password.length < 6) {
			res.status(400).send({
				message: "Failed! Password Must be at least of 6 Characters Length.",
			});
			return;
		}
	} else {
		res.status(400).send({ message: "Please Specify User Password." });
		return;
	}

	next();
};

const verifySignUp = {
	checkDuplicateNumber: checkDuplicateNumber,
	checkRolesExisted: checkRolesExisted,
	checkPasswordStrength: checkPasswordStrength,
};

module.exports = verifySignUp;
