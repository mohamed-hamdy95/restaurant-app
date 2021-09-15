const { authJwt } = require("../middleware");
const controller = require("../controllers/table.controller");

module.exports = function (app) {
	app.use(function (req, res, next) {
		res.header("Access-Control-Allow-Headers", "authorization, Origin, Content-Type, Accept");
		next();
	});

	app.get("/api/tables", [authJwt.verifyToken, authJwt.isAdmin], controller.getTables);
	app.post("/api/tables", [authJwt.verifyToken, authJwt.isAdmin], controller.storeTable);
	app.delete("/api/tables/:id", [authJwt.verifyToken, authJwt.isAdmin], controller.deleteTable);
};
