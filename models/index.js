const _ = require("lodash");

const config = require("config");
const Sequelize = require("sequelize");

const db = config.get("database");
const sequelize = new Sequelize(db.name, db.username, db.password, db.options);

const database = {
    sequelize
};

const models = {
    promo: require.resolve("./promo.model"),
    ac: require.resolve("./ac.model"),
    order: require.resolve("./order.model")
};

_.each(models, (path, name) => {
    database[name] = sequelize.import(path);
});


module.exports = database;