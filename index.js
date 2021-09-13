const express = require("express");
const cors = require("cors");
var bcrypt = require("bcryptjs");

const app = express();

var corsOptions = {
	origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = require("./src/models");
const Role = db.role;
const User = db.user;

db.sequelize.sync({ force: true }).then(() => {
	console.log("Drop and Resync Db");
	initial();
});

require("./src/routes/auth.routes")(app);
require("./src/routes/user.routes")(app);

// simple route
app.get("/", (req, res) => {
	res.json({ message: "Welcome to Restaurant Application." });
});

function initial() {
	Role.create({
		id: 1,
		name: "admin",
	});

	Role.create({
		id: 2,
		name: "employee",
	});

	User.create({
		number: "1234",
		password: bcrypt.hashSync("secret123", 8),
	}).then((user) => {
		user.setRoles([1, 2]);
	});
}
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

// create a new User: create(object)
// find a User by id: findByPk(id)
// find a User by email: findOne({ where: { email: ... } })
// get all Users: findAll()
// find all Users by number: findAll({ where: { number: ... } })
