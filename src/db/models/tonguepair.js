"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class TonguePair extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            TonguePair.belongsTo(models.Tongue, {
                foreignKey: "translateTo",
            });
            TonguePair.belongsTo(models.Tongue, {
                foreignKey: "translateFrom",
            });
            TonguePair.hasMany(models.Sheet, {
                foreignKey: "tonguePair",
            });
            TonguePair.hasMany(models.Question, {
                foreignKey: "tonguePair",
            });
        }
    }
    TonguePair.init(
        {
            translateFrom: {
                type: DataTypes.INTEGER,
                references: {
                    model: "Tongues",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                allowNull: false,
            },
            translateTo: {
                type: DataTypes.INTEGER,
                references: {
                    model: "Tongues",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "TonguePair",
            timestamps: true,
        },
    );
    return TonguePair;
};
