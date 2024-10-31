import { DataTypes, Model } from "sequelize";
import sequelize from "./index";

class SheetQuestion extends Model {
    declare sheet: number;
    declare question: number;
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

export default SheetQuestion;
