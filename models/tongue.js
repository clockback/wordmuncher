"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Tongue extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Tongue.hasMany(models.TonguePair, {
                foreignKey: "translateTo",
                as: "tonguePairs",
            });
            Tongue.hasMany(models.TonguePair, {
                foreignKey: "translateFrom",
                as: "tonguePairs",
            });
        }
    }
    Tongue.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tongueName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            flag: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Tongue",
            timestamps: true,
        },
    );
    return Tongue;
};
