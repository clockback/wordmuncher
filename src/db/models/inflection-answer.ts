import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { InflectionFeature, Question } from "@models";

import sequelize from "./db-connection";

export class InflectionAnswer extends Model<
    InferAttributes<InflectionAnswer, { omit: "question" }>,
    InferCreationAttributes<InflectionAnswer, { omit: "question" }>
> {
    declare id: CreationOptional<number>;

    declare questionId: ForeignKey<Question["id"]>;
    declare question?: NonAttribute<Question>;

    declare primaryFeatureId: ForeignKey<InflectionFeature["id"]>;
    declare primaryFeature?: NonAttribute<InflectionFeature>;

    declare secondaryFeatureId: ForeignKey<InflectionFeature["id"]> | null;
    declare secondaryFeature?: NonAttribute<InflectionFeature | null>;

    declare answerText: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        InflectionAnswer.belongsTo(InflectionFeature, {
            foreignKey: "primaryFeatureId",
            as: "primaryFeature",
        });
        InflectionAnswer.belongsTo(InflectionFeature, {
            foreignKey: "secondaryFeatureId",
            as: "secondaryFeature",
        });
    }
}

InflectionAnswer.init(
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
        primaryFeatureId: {
            type: DataTypes.INTEGER,
            references: {
                model: "InflectionFeatures",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        secondaryFeatureId: {
            type: DataTypes.INTEGER,
            references: {
                model: "InflectionFeatures",
                key: "id",
            },
            allowNull: true,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
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
        modelName: "InflectionAnswer",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: [
                    "questionId",
                    "primaryFeatureId",
                    "secondaryFeatureId",
                ],
            },
        ],
    },
);
