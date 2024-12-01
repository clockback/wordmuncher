import { Association, CreationOptional, DataTypes, Model } from "sequelize";
import sequelize from "./db-connection";
import { TonguePair } from "@models";

export class Tongue extends Model {
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
    },
    {
        sequelize,
        modelName: "Tongue",
        timestamps: true,
    },
);
