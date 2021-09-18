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
const Table = db.table;
const Reservation = db.reservation;

db.sequelize.sync({ force: true }).then(() => {
	console.log("Drop and Resync Db");
	initial();
});

require("./src/routes/auth.routes")(app);
require("./src/routes/user.routes")(app);
require("./src/routes/table.routes")(app);
require("./src/routes/reservation.routes")(app);

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

	const tables = [
		{
			seats: 2,
			count: 2,
		},
		{
			seats: 4,
			count: 1,
		},
		{
			seats: 6,
			count: 3,
		},
	];

	for (let index = 0; index < tables.length; index++) {
		const { seats, count } = tables[index];
		for (let tableIndex = 0; tableIndex < count; tableIndex++) {
			Table.create({
				seats,
				number: `${seats}-${tableIndex + 1}`,
			}).then((table) => {
				const { id } = table;
				Reservation.create({
					tableId: id,
					startsAt: new Date().setHours(14, 0, 0, 0),
					endsAt: new Date().setHours(14, 30, 0, 0),
				});

				Reservation.create({
					tableId: id,
					startsAt: new Date().setHours(15, 0, 0, 0),
					endsAt: new Date().setHours(15, 30, 0, 0),
				});

				Reservation.create({
					tableId: id,
					startsAt: new Date().setHours(17, 0, 0, 0),
					endsAt: new Date().setHours(17, 30, 0, 0),
				});
			});
		}
	}
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
