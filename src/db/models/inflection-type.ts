import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { InflectionCategory, TonguePair } from "@models";

import sequelize from "./db-connection";

export class InflectionType extends Model<
    InferAttributes<InflectionType, { omit: "tonguePair" }>,
    InferCreationAttributes<InflectionType, { omit: "tonguePair" }>
> {
    declare id: CreationOptional<number>;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair?: NonAttribute<TonguePair>;

    declare typeName: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare categories?: NonAttribute<InflectionCategory[]>;

    static associate() {
        InflectionType.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
            as: "tonguePair",
        });
        InflectionType.hasMany(InflectionCategory, {
            foreignKey: "inflectionTypeId",
            as: "categories",
        });
    }
}

InflectionType.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        tonguePairId: {
            type: DataTypes.INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        typeName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "InflectionType",
        timestamps: true,
        indexes: [{ unique: true, fields: ["tonguePairId", "typeName"] }],
    },
);
