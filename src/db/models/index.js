"use strict";

const { Sequelize, DataTypes } = require("sequelize");
const process = require("process");
const env = process.env.NODE_ENV || "development";
const config = require("#root/src/db/config/config.js");

let sequelize = new Sequelize(config[env]);

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
