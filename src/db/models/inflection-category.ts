import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { InflectionFeature, InflectionType } from "@models";

import sequelize from "./db-connection";

export class InflectionCategory extends Model<
    InferAttributes<
        InflectionCategory,
        { omit: "inflectionType" | "features" }
    >,
    InferCreationAttributes<
        InflectionCategory,
        { omit: "inflectionType" | "features" }
    >
> {
    declare id: CreationOptional<number>;

    declare inflectionTypeId: ForeignKey<InflectionType["id"]>;
    declare inflectionType?: NonAttribute<InflectionType>;

    declare categoryName: string;
    declare isPrimary: boolean;

    declare features: NonAttribute<InflectionFeature[]>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        InflectionCategory.belongsTo(InflectionType, {
            foreignKey: "inflectionTypeId",
            as: "inflectionType",
        });
        InflectionCategory.hasMany(InflectionFeature, {
            foreignKey: "inflectionCategoryId",
            as: "features",
        });
    }
}

InflectionCategory.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        inflectionTypeId: {
            type: DataTypes.INTEGER,
            references: {
                model: "InflectionTypes",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isPrimary: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "InflectionCategory",
        timestamps: true,
        indexes: [
            { unique: true, fields: ["inflectionTypeId", "categoryName"] },
        ],
    },
);
