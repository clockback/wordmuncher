import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { Tongue, TonguePair } from "@models";

import sequelize from "./db-connection";

export class Settings extends Model<
    InferAttributes<Settings, { omit: "tonguePair" | "nativeTongue" }>,
    InferCreationAttributes<Settings, { omit: "tonguePair" | "nativeTongue" }>
> {
    declare id: CreationOptional<number>;

    declare tonguePairId?: ForeignKey<TonguePair["id"]>;
    declare tonguePair?: NonAttribute<TonguePair>;

    declare nativeTongueId: ForeignKey<Tongue["id"]>;
    declare nativeTongue?: NonAttribute<Tongue>;

    declare ignoreDiacritics: CreationOptional<boolean>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Settings.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
            as: "tonguePair",
        });
        Settings.belongsTo(Tongue, {
            foreignKey: "nativeTongueId",
            as: "nativeTongue",
        });
    }
}

Settings.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tonguePairId: {
            type: DataTypes.INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            onUpdate: "CASCADE",
            allowNull: true,
        },
        nativeTongueId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            onUpdate: "CASCADE",
            allowNull: true,
        },
        ignoreDiacritics: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Settings",
        timestamps: true,
    },
);
