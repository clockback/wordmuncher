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

export class Result extends Model<
    InferAttributes<Result, { omit: "question" }>,
    InferCreationAttributes<Result, { omit: "question" }>
> {
    declare id: CreationOptional<number>;

    declare questionId: ForeignKey<Question["id"]>;
    declare question?: NonAttribute<Question>;

    declare stars: number;
    declare goal: number;
    declare current: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Result.belongsTo(Question, { foreignKey: "questionId", as: "result" });
    }
}

Result.init(
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
            unique: true,
        },
        stars: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        goal: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        current: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Result",
        timestamps: true,
    },
);
