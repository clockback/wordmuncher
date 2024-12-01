import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import sequelize from "./db-connection";
import { Question, SheetQuestion, TonguePair } from "@models";

export class Sheet extends Model<
    InferAttributes<Sheet, { omit: "tonguePair" }>,
    InferCreationAttributes<Sheet, { omit: "tonguePair" }>
> {
    declare id: CreationOptional<number>;

    declare sheetName: string;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair: NonAttribute<TonguePair>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Sheet.hasMany(SheetQuestion, {
            foreignKey: "sheetId",
        });

        Sheet.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
        });

        Sheet.belongsToMany(Question, {
            through: SheetQuestion,
            foreignKey: "questionId",
            as: "sheetId",
        });
    }
}
Sheet.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        sheetName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tonguePairId: {
            type: DataTypes.INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
            allowNull: false,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Sheet",
        timestamps: true,
    },
);
