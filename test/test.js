const supertest = require("supertest");
const should = require("should");
const format = require("date-fns/format");

// This agent refers to PORT where program is runninng.

let token = "";

const server = supertest.agent("http://localhost:8080/api");

// UNIT test begin

describe("Reservations Functionality unit test", function () {
	// #1 should return home page

	it("should return signin Token", function (done) {
		// calling home page api
		server
			.post("/auth/signin")
			.send({ number: "1234", password: "secret123" })
			.expect("Content-type", /json/)
			.expect(200) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 200
				res.status.should.equal(200);
				token = res.body.accessToken;
				done();
			});
	});

	it("should return today reservations", function (done) {
		// calling today reservation api
		server
			.get("/reservations/today")
			.set({ Authorization: token })
			.expect("Content-type", /json/)
			.expect(200) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 200
				res.status.should.equal(200);
				done();
			});
	});

	it("should return all reservations", function (done) {
		// calling today reservation api
		server
			.get("/reservations/all")
			.set({ Authorization: token })
			.expect("Content-type", /json/)
			.expect(200) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 200
				res.status.should.equal(200);
				done();
			});
	});

	it("should return the available time slots for tables of 2 seats for 2 customers", function (done) {
		server
			.get("/reservations/check?seats=2")
			.set({ Authorization: token })
			.expect("Content-type", /json/)
			.expect(200) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 200
				res.status.should.equal(200);
				done();
			});
	});

	it("should return Error 400 the available time slots for 20 customers as it largets table has 6 seats", function (done) {
		server
			.get("/reservations/check?seats=20")
			.set({ Authorization: token })
			.expect("Content-type", /json/)
			.expect(400) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 400
				res.status.should.equal(400);
				done();
			});
	});

	it("should return Success 200 for Creating a Reservation on table with 4 seats for 3 customer with startsAt 16:00 to 16:10 But will fail if test run in time out of The Sift Time", function (done) {
		server
			.post("/reservations")
			.set({ Authorization: token })
			.send({
				startsAt: format(new Date().setHours(16, 0, 0, 0), "yyyy-MM-dd HH:mm"),
				endsAt: format(new Date().setHours(16, 10, 0, 0), "yyyy-MM-dd HH:mm"),
				tableId: 3,
			})
			.expect("Content-type", /json/)
			.expect(200) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 200
				res.status.should.equal(200);
				done();
			});
	});

	it("should return Success 400 for Creating a Reservation on table with 4 seats for 3 customer with startsAt 16:00 to 16:10 which is Reserved in previous Test.", function (done) {
		server
			.post("/reservations")
			.set({ Authorization: token })
			.send({
				startsAt: format(new Date().setHours(16, 0, 0, 0), "yyyy-MM-dd HH:mm"),
				endsAt: format(new Date().setHours(16, 10, 0, 0), "yyyy-MM-dd HH:mm"),
				tableId: 3,
			})
			.expect("Content-type", /json/)
			.expect(400) // THis is HTTP response
			.end(function (err, res) {
				// HTTP status should be 400
				res.status.should.equal(400);
				done();
			});
	});
});
