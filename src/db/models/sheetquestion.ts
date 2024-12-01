import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import sequelize from "./db-connection";
import { Question, Sheet } from "@models";

export class SheetQuestion extends Model<
    InferAttributes<SheetQuestion, { omit: "sheet" | "question" }>,
    InferCreationAttributes<SheetQuestion, { omit: "sheet" | "question" }>
> {
    declare id: CreationOptional<number>;

    declare sheetId: ForeignKey<Sheet["id"]>;
    declare sheet: NonAttribute<Sheet>;

    declare questionId: ForeignKey<Question["id"]>;
    declare question: NonAttribute<Question>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        SheetQuestion.belongsTo(Sheet, {
            foreignKey: "sheetId",
        });
        SheetQuestion.belongsTo(Question, {
            foreignKey: "questionId",
        });
    }
}

SheetQuestion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        sheetId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Sheets",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        questionId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Questions",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "SheetQuestion",
        timestamps: true,
    },
);
