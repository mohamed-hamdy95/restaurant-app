const db = require("../models");
const { paginate } = require("../helpers/query.helper");
const isMatch = require("date-fns/isMatch");
const isBefore = require("date-fns/isBefore");
const differenceInMinutes = require("date-fns/differenceInMinutes");
const { reservation } = require("../models");
const Reservation = db.reservation;
const Table = db.table;
const Op = db.Sequelize.Op;
const { SHIFT_START: shiftStart, SHIFT_END: shiftEnd } = db;

exports.getTodayReservations = async (req, res) => {
	try {
		const { query } = req,
			page = parseInt(query.page) || 1,
			order = query.order == "desc" ? "desc" : "asc";
		(NOW = new Date().setMinutes(0, 0, 0)), (TODAY_END = new Date().setHours(23, 59, 59, 999));

		const result = await Reservation.findAndCountAll({
			where: {
				startsAt: {
					[Op.gte]: NOW,
					[Op.lt]: TODAY_END,
				},
			},
			order: [["startsAt", order]],
			...paginate({ page, perPage: 10 }),
		});
		res.status(200).send({ reservations: result.rows, totalPages: Math.floor(result.count / 10) || 1, page });
		return;
	} catch (error) {
		res.status(500).send({ message: e.message });
		return;
	}
};

exports.getAllReservations = async (req, res) => {
	try {
		const { query } = req,
			page = parseInt(query.page) || 1,
			order = query.order == "desc" ? "desc" : "asc",
			tableId = query.tableId ? query.tableId : false;

		const queryObj = tableId
			? {
					tableId: {
						[Op.eq]: tableId,
					},
			  }
			: {};
		const result = await Reservation.findAndCountAll({
			where: queryObj,
			order: [["startsAt", order]],
			...paginate({ page, perPage: 10 }),
		});
		res.status(200).send({ reservations: result.rows, totalPages: Math.floor(result.count / 10) || 1, page });
		return;
	} catch (error) {
		res.status(500).send({ message: e.message });
		return;
	}
};

exports.storeReservation = async (req, res) => {
	const {
		body: { startsAt, endsAt, tableId },
	} = req;

	if (!tableId) {
		res.status(400).send({ message: "tableId field is required." });
		return;
	}

	if (isNaN(tableId)) {
		res.status(400).send({ message: "tableId field must be numeric." });
		return;
	}

	if (!startsAt) {
		res.status(400).send({ message: "startsAt field is required." });
		return;
	}

	if (!endsAt) {
		res.status(400).send({ message: "endsAt field is required." });
		return;
	}

	if (!isMatch(startsAt, "yyyy-MM-dd HH:mm")) {
		res.status(400).send({ message: "startsAt Must Be Date Formatted as yyyy-MM-dd HH:mm." });
		return;
	}

	if (!isMatch(endsAt, "yyyy-MM-dd HH:mm")) {
		res.status(400).send({ message: "endsAt Must Be Date Formatted as yyyy-MM-dd HH:mm." });
		return;
	}

	let startTime = new Date(startsAt);
	let endTime = new Date(endsAt);

	if (isBefore(endTime, startTime)) {
		res.status(400).send({
			message: `Reservation endsAt cannot be before startsAt.`,
		});
		return;
	}

	const startDate = `${startTime.getFullYear()}-${startTime.getMonth()}-${startTime.getDate()}`;
	const endDate = `${endTime.getFullYear()}-${endTime.getMonth()}-${endTime.getDate()}`;
	if (startDate != endDate) {
		res.status(400).send({
			message: `Reservation startsAt and endsAt must Be on the same Date.`,
		});
		return;
	}

	if (isBefore(startTime, new Date()) || isBefore(endTime, new Date())) {
		res.status(400).send({
			message: "Reservation Time cannot be in the Past.",
		});
		return;
	}

	const checkTableExists = await Table.findByPk(tableId);

	if (!checkTableExists) {
		res.status(404).send({ message: "Table Not Found." });
		return;
	}

	startTime = startTime.getHours() * 60 + startTime.getMinutes();
	endTime = endTime.getHours() * 60 + endTime.getMinutes();
	const shiftStartTime = shiftStart.getHours() * 60 + shiftStart.getMinutes();
	const shiftEndTime = shiftEnd.getHours() * 60 + shiftEnd.getMinutes();

	const reservationStartsAtCondition = startTime >= shiftStartTime && startTime <= shiftEndTime;
	const reservationEndsAtCondition = endTime >= shiftStartTime && endTime <= shiftEndTime;

	if (!(reservationStartsAtCondition || reservationEndsAtCondition)) {
		res.status(400).send({
			message: `Reservation Must Be Within the Shift Working Hours Interval, from: ${String(
				shiftStart.getHours()
			).padStart(2, "0")}:${String(shiftStart.getMinutes()).padStart(2, "0")} to: ${String(
				shiftEnd.getHours()
			).padStart(2, "0")}:${String(shiftEnd.getMinutes()).padStart(2, "0")}.`,
		});
		return;
	}

	const reservationOverlaps = await Reservation.findAll({
		where: {
			[Op.or]: [
				{
					startsAt: {
						[Op.between]: [startsAt, endsAt],
					},
				},
				{
					endsAt: {
						[Op.between]: [startsAt, endsAt],
					},
				},
			],
		},
	});

	if (reservationOverlaps.length > 0) {
		res.status(400).send({
			message: "This Table is already reserved or overlapping with another Customer on that Time Interval.",
		});
		return;
	}

	await Reservation.create({
		tableId,
		startsAt,
		endsAt,
	});

	res.status(200).send({ message: "Reservation Created Successfully." });
	return;
};

exports.deleteReservation = async (req, res) => {
	const {
		params: { id },
	} = req;
	const reservation = await Reservation.findByPk(id);
	if (!reservation) {
		res.status(404).send({ message: "Reservation not Found." });
		return;
	}
	const startTime = new Date(reservation.startsAt),
		endTime = new Date(reservation.endsAt);
	if (isBefore(startTime, new Date()) || isBefore(endTime, new Date())) {
		res.status(400).send({
			message: "Cannot Delete Reservation in the Past.",
		});
		return;
	}

	await Reservation.destroy({
		where: {
			id,
		},
	});
	res.status(200).send({ message: "Reservation Deleted Successfully." });
};

exports.checkAvailability = async (req, res) => {
	try {
		const {
				query: { seats },
			} = req,
			NOW = new Date().setSeconds(0, 0),
			TODAY_END = new Date().setHours(23, 59, 59, 999);

		if (!seats) {
			res.status(400).send({ message: "Please Specify 'seats' for Customer Requesting Reservation." });
			return;
		}

		if (isNaN(seats)) {
			res.status(400).send({ message: "Query Param 'seats' must be Numeric Value." });
			return;
		}

		const suitableSeats = await Table.min("seats", {
			where: {
				seats: {
					[Op.gte]: seats,
				},
			},
		});

		if (!suitableSeats) {
			res.status(400).send({ message: "The Request Seats is Greater Than The Biggest Table Exists." });
			return;
		}

		const suitableTables = await Table.findAll({
			where: {
				seats: suitableSeats,
			},
			include: {
				model: Reservation,
				as: "reservations",
				where: {
					startsAt: {
						[Op.gte]: NOW,
						[Op.lt]: TODAY_END,
					},
				},
				order: [["startsAt", "asc"]],
			},
		});
		const availability = [];
		suitableTables.forEach(({ reservations, number, id, seats }) => {
			const availableTimeRanges = [];
			let index = 0,
				start,
				end;
			do {
				start = index === 0 ? new Date(NOW) : new Date(reservations[index - 1].endsAt);
				end = index === reservations.length ? new Date(TODAY_END) : new Date(reservations[index].startsAt);
				console.log({ start, end, index });
				if (differenceInMinutes(end, start) > 1) {
					availableTimeRanges.push(formatDateRangeToString(start, end));
				}
				index++;
			} while (index <= reservations.length);

			availability.push({
				id,
				number,
				seats,
				availableTimeRanges,
			});
		});

		res.status(200).send({ availability });
		return;
	} catch (error) {
		console.log({ error });
		res.status(500).send({ message: "Something Went Wrong" });
		return;
	}
};

const formatDateRangeToString = (start, end) => {
	return `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")} - ${String(
		end.getHours()
	).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
};
