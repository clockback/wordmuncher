import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { InflectionCategory } from "@models";

import sequelize from "./db-connection";

export class InflectionFeature extends Model<
    InferAttributes<InflectionFeature, { omit: "inflectionCategory" }>,
    InferCreationAttributes<InflectionFeature, { omit: "inflectionCategory" }>
> {
    declare id: CreationOptional<number>;

    declare inflectionCategoryId: ForeignKey<InflectionCategory["id"]>;
    declare inflectionCategory?: NonAttribute<InflectionCategory>;

    declare featureName: string;
    declare orderInCategory: number;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        InflectionFeature.belongsTo(InflectionCategory, {
            foreignKey: "inflectionCategoryId",
            as: "inflectionCategory",
        });
    }
}

InflectionFeature.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        inflectionCategoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: "InflectionCategories",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        featureName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        orderInCategory: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "InflectionFeature",
        timestamps: true,
        indexes: [
            { unique: true, fields: ["inflectionCategoryId", "featureName"] },
            {
                unique: true,
                fields: ["inflectionCategoryId", "orderInCategory"],
            },
        ],
    },
);
