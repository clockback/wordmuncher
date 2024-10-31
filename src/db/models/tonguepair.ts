import { Association, DataTypes, Model } from "sequelize";
import sequelize from "./index";
import Sheet from "./sheet";
import Question from "./question";

class TonguePair extends Model {
    declare id: number;
    declare translateFrom: number;
    declare translateTo: number;

    declare static associations: {
        Sheets: Association<TonguePair, Sheet>;
        Questions: Association<TonguePair, Question>;
    };

    static associate(models) {
        TonguePair.belongsTo(models.Tongue, {
            foreignKey: "translateTo",
        });
        TonguePair.belongsTo(models.Tongue, {
            foreignKey: "translateFrom",
        });
        TonguePair.hasMany(models.Sheet, {
            foreignKey: "tonguePair",
        });
        TonguePair.hasMany(models.Question, {
            foreignKey: "tonguePair",
        });
    }
}

TonguePair.init(
    {
        translateFrom: {
            type: DataTypes.INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
        translateTo: {
            type: DataTypes.INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "TonguePair",
        timestamps: true,
    },
);

export default TonguePair;
