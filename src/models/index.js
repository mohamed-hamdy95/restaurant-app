const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
	host: config.HOST,
	dialect: config.dialect,
	operatorsAliases: "0",
	pool: {
		max: config.pool.max,
		min: config.pool.min,
		acquire: config.pool.acquire,
		idle: config.pool.idle,
	},
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.table = require("./table.model.js")(sequelize, Sequelize);
db.reservation = require("./reservation.model.js")(sequelize, Sequelize);

db.reservation.belongsTo(db.table, { as: "table", foreignKey: "tableId" });
db.table.hasMany(db.reservation, { as: "reservations", foreignKey: "tableId" });

db.role.belongsToMany(db.user, {
	through: "user_roles",
	foreignKey: "roleId",
	otherKey: "userId",
});
db.user.belongsToMany(db.role, {
	through: "user_roles",
	foreignKey: "userId",
	otherKey: "roleId",
});

db.ROLES = ["admin", "employee"];

const date = new Date();
const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0);

db.SHIFT_START = start;
db.SHIFT_END = end;

module.exports = db;
