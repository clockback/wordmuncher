import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";
import sequelize from "./index";
import TonguePair from "./tonguepair";

class Question extends Model<
    InferAttributes<Question, { omit: "tonguePair" }>,
    InferCreationAttributes<Question, { omit: "tonguePair" }>
> {
    declare id: number;
    declare questionText: string;
    declare answer: string;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair: NonAttribute<TonguePair>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Question.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        questionText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        answer: {
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
        modelName: "Question",
        timestamps: true,
    },
);

export default Question;
