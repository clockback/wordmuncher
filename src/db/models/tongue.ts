import {
    Association,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
} from "sequelize";

import { TonguePair } from "@models";

import sequelize from "./db-connection";

export class Tongue extends Model<
    InferAttributes<Tongue>,
    InferCreationAttributes<Tongue>
> {
    declare id: CreationOptional<number>;
    declare tongueName: string;
    declare flag: string;

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
            as: "studyingTongueId",
        });
        Tongue.belongsToMany(Tongue, {
            through: TonguePair,
            foreignKey: "studyingTongueId",
            as: "nativeTongueId",
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
