import { Association, DataTypes, Model } from "sequelize";
import sequelize from "./index";
import SheetQuestion from "./sheetquestion";

class Sheet extends Model {
    declare id: number;
    declare sheetName: string;
    declare tonguePair: number;

    declare static associations: {
        SheetQuestions: Association<Sheet, SheetQuestion>;
    };
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

export default Sheet;
