"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class SheetQuestion extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            SheetQuestion.belongsTo(models.Sheet, {
                foreignKey: "sheet",
                as: "sheet",
            });
            SheetQuestion.belongsTo(models.Question, {
                foreignKey: "question",
                as: "question",
            });
        }
    }
    SheetQuestion.init(
        {
            sheet: {
                type: DataTypes.INTEGER,
                references: {
                    model: "Sheets",
                    key: "id",
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            question: {
                type: DataTypes.INTEGER,
                references: {
                    model: "Sheets",
                    key: "id",
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "SheetQuestion",
            timestamps: true,
        },
    );
    return SheetQuestion;
};
