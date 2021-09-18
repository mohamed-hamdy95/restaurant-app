module.exports = (sequelize, Sequelize) => {
	const Reservation = sequelize.define("reservations", {
		startsAt: {
			type: Sequelize.DATE,
		},
		endsAt: {
			type: Sequelize.DATE,
		},
	});
	return Reservation;
};
