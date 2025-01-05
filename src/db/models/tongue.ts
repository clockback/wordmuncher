import {
    Association,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { TonguePair } from "@models";

import sequelize from "./db-connection";

export class Tongue extends Model<
    InferAttributes<Tongue, { omit: "studies" | "learnedBy" }>,
    InferCreationAttributes<Tongue, { omit: "studies" | "learnedBy" }>
> {
    declare id: CreationOptional<number>;
    declare tongueName: string;
    declare flag: string;

    declare studies: NonAttribute<Tongue[]>;
    declare learnedBy: NonAttribute<Tongue[]>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare static associations: {
        TonguePairsFrom: Association<Tongue, TonguePair>;
        TonguePairsTo: Association<Tongue, TonguePair>;
    };

    static associate() {
        Tongue.hasMany(TonguePair, {
            foreignKey: "nativeTongueId",
        });
        Tongue.hasMany(TonguePair, {
            foreignKey: "studyingTongueId",
        });
        Tongue.belongsToMany(Tongue, {
            through: TonguePair,
            foreignKey: "nativeTongueId",
            as: "studies",
        });
        Tongue.belongsToMany(Tongue, {
            through: TonguePair,
            foreignKey: "studyingTongueId",
            as: "learnedBy",
        });
    }
}

Tongue.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        tongueName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        flag: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Tongue",
        timestamps: true,
    },
);
