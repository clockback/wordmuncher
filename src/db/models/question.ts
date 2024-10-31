import { Association, DataTypes, Model } from "sequelize";
import sequelize from "./index";
import SheetQuestion from "./sheetquestion";

class Question extends Model {
    declare id: number;
    declare questionText: string;
    declare answer: string;
    declare tonguePair: number;

    declare static associations: {
        sheetQuestions: Association<Question, SheetQuestion>;
    };
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

export default Question;
