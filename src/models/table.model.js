module.exports = (sequelize, Sequelize) => {
	const Table = sequelize.define("tables", {
		number: {
			type: Sequelize.STRING,
		},
		seats: {
			type: Sequelize.INTEGER,
			min: 1,
			max: 12,
		},
	});

	return Table;
};
