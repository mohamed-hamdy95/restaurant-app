const { authJwt } = require("../middleware");
const controller = require("../controllers/reservation.controller");

module.exports = function (app) {
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Headers", "authorization, Origin, Content-Type, Accept");
		next();
	});

	app.get(
		"/api/reservations/today",
		[authJwt.verifyToken, authJwt.isEmployeeOrAdmin],
		controller.getTodayReservations
	);
	app.get("/api/reservations/all", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllReservations);

	app.post("/api/reservations", [authJwt.verifyToken, authJwt.isEmployeeOrAdmin], controller.storeReservation);

	app.delete("/api/reservations/:id", [authJwt.verifyToken, authJwt.isEmployeeOrAdmin], controller.deleteReservation);

	app.get("/api/reservations/check", [authJwt.verifyToken, authJwt.isEmployeeOrAdmin], controller.checkAvailability);
};
