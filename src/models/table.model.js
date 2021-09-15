module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define("tables", {
		number: {
			type: Sequelize.STRING,
		},
		seats: {
			type: Sequelize.INTEGER,
			min: 1,
			max: 12,
		},
	});

	return User;
};
