"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Sheet extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Sheet.belongsTo(models.TonguePair, {
                foreignKey: "tonguePair",
            });
            Sheet.hasMany(models.SheetQuestion, {
                foreignKey: "sheet",
            });
        }
    }
    Sheet.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            sheetName: {
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
            modelName: "Sheet",
            timestamps: true,
        },
    );
    return Sheet;
};
