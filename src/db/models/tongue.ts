import { Association, CreationOptional, DataTypes, Model } from "sequelize";
import sequelize from "./index";
import TonguePair from "./tonguepair";

class Tongue extends Model {
    declare id: CreationOptional<number>;
    declare tongueName: string;
    declare flag: string;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare static associations: {
        TonguePairsFrom: Association<Tongue, TonguePair>;
        TonguePairsTo: Association<Tongue, TonguePair>;
    };
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

export default Tongue;
