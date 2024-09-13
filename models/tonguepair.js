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
                as: "tongue",
            });
            TonguePair.belongsTo(models.Tongue, {
                foreignKey: "translateFrom",
                as: "tongue",
            });
            TonguePair.hasMany(models.Sheet, {
                foreignKey: "tonguePair",
                as: "sheets",
            });
            TonguePair.hasMany(models.Question, {
                foreignKey: "tonguePair",
                as: "questions",
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
