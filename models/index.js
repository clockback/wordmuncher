"use strict";

const { Sequelize, DataTypes } = require("sequelize");
const process = require("process");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(
        config.database,
        config.username,
        config.password,
        config,
    );
}

const Tongue = require("./tongue")(sequelize, DataTypes);
const TonguePair = require("./tonguepair")(sequelize, DataTypes);
const Sheet = require("./sheet")(sequelize, DataTypes);
const Question = require("./question")(sequelize, DataTypes);
const SheetQuestion = require("./sheetquestion")(sequelize, DataTypes);

const db = {
    Tongue,
    TonguePair,
    Sheet,
    Question,
    SheetQuestion,
};

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
