import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { Answer, Sheet, SheetQuestion, TonguePair } from "@models";

import sequelize from "./db-connection";

export class Question extends Model<
    InferAttributes<Question, { omit: "tonguePair" }>,
    InferCreationAttributes<Question, { omit: "tonguePair" }>
> {
    declare id: number;
    declare questionText: string;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair: NonAttribute<TonguePair>;

    declare answers?: NonAttribute<Answer[]>;
    declare sheets?: NonAttribute<Sheet[]>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Question.hasMany(SheetQuestion, {
            foreignKey: "questionId",
        });

        Question.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
        });

        Question.belongsToMany(Sheet, {
            through: SheetQuestion,
            foreignKey: "sheetId",
            as: "sheets",
        });

        Question.hasMany(Answer, { foreignKey: "questionId", as: "answers" });
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
        tonguePairId: {
            type: DataTypes.INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Question",
        timestamps: true,
    },
);
