"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Question extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Question.belongsTo(models.TonguePair, {
                foreignKey: "tonguePair",
                as: "tonguePair",
            });
            Question.hasMany(models.SheetQuestion, {
                foreignKey: "question",
                as: "questions",
            });
        }
    }
    Question.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            questionText: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            answer: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            tonguePair: {
                type: DataTypes.INTEGER,
                references: {
                    model: "TonguePairs",
                    key: "id",
                },
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Question",
            timestamps: true,
        },
    );
    return Question;
};
