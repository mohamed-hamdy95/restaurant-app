const db = require("../models");
const { paginate } = require("../helpers/query.helper");
const Table = db.table;
const Reservation = db.reservation;

exports.getTables = async (req, res) => {
	try {
		const { query } = req;
		const page = parseInt(query.page) || 1;
		const result = await Table.findAndCountAll({
			...paginate({ page, perPage: 10 }),
		});
		res.status(200).send({ tables: result.rows, totalPages: Math.floor(result.count / 10) || 1, page });
		return;
	} catch (error) {
		res.status(500).send({ message: e.message });
	}
};

exports.storeTable = async (req, res) => {
	const {
		body: { number, seats },
	} = req;
	const checkTableExists = await Table.findOne({
		where: {
			number: String(number),
		},
	});

	if (!number) {
		res.status(400).send({ message: "number field is required." });
		return;
	}

	if (!seats) {
		res.status(400).send({ message: "seats field is required." });
		return;
	}

	if (isNaN(seats)) {
		res.status(400).send({ message: "seats field must be integer." });
		return;
	}

	if (parseInt(seats) > 12 || parseInt(seats) < 1) {
		res.status(400).send({ message: "seats field must be between (1 - 12) inclusive." });
		return;
	}

	if (checkTableExists) {
		res.status(400).send({ message: "This Number Already Assigned to another Table." });
		return;
	}

	await Table.create({
		number: String(number),
		seats: parseInt(seats),
	});

	res.status(200).send({ message: "Table Created Successfully." });
	return;
};

exports.deleteTable = async (req, res) => {
	const {
		params: { id },
	} = req;
	const table = await Table.findByPk(id, {
		include: [
			{
				model: Reservation,
				as: "reservations",
			},
		],
	});

	if (!table) {
		res.status(404).send({ message: "Table not Found." });
		return;
	}

	if (table.reservations.length > 0) {
		res.status(400).send({ message: "Cannot Delete Table Having Reservations." });
		return;
	}

	await Table.destroy({
		where: {
			id,
		},
	});

	res.status(200).send({ message: "Table Deleted Successfully." });
	return;
};
