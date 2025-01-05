import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { Question } from "@models";

import sequelize from "./db-connection";

export class Answer extends Model<
    InferAttributes<Answer, { omit: "question" }>,
    InferCreationAttributes<Answer, { omit: "question" }>
> {
    declare id: CreationOptional<number>;
    declare isMainAnswer: boolean;
    declare answerText: string;

    declare questionId: ForeignKey<Question["id"]>;
    declare question?: NonAttribute<Question>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Answer.belongsTo(Question, {
            foreignKey: "questionId",
            as: "question",
        });
    }
}

Answer.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        questionId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Questions",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        isMainAnswer: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
        },
        answerText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Answer",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["questionId", "answerText"],
            },
        ],
    },
);
