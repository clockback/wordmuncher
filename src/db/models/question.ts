import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import {
    Answer,
    InflectionAnswer,
    InflectionType,
    Result,
    Sheet,
    SheetQuestion,
    TonguePair,
} from "@models";

import sequelize from "./db-connection";

export class Question extends Model<
    InferAttributes<Question, { omit: "tonguePair" | "inflectionType" }>,
    InferCreationAttributes<Question, { omit: "tonguePair" | "inflectionType" }>
> {
    declare id: number;
    declare questionText: string;
    declare isStudyingLanguage: CreationOptional<boolean>;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair: NonAttribute<TonguePair>;

    declare inflectionTypeId: ForeignKey<InflectionType["id"] | null>;
    declare inflectionType?: NonAttribute<InflectionType | null>;

    declare answers?: NonAttribute<Answer[]>;
    declare inflectionAnswers?: NonAttribute<InflectionAnswer[]>;
    declare sheets?: NonAttribute<Sheet[]>;
    declare result?: NonAttribute<Result>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Question.hasMany(SheetQuestion, {
            foreignKey: "questionId",
        });

        Question.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
        });

        Question.belongsTo(InflectionType, {
            foreignKey: "inflectionTypeId",
            as: "inflectionType",
        });

        Question.hasMany(InflectionAnswer, {
            foreignKey: "questionId",
            as: "inflectionAnswers",
        });

        Question.belongsToMany(Sheet, {
            through: SheetQuestion,
            foreignKey: "questionId",
            otherKey: "sheetId",
            as: "sheets",
        });

        Question.hasMany(Answer, { foreignKey: "questionId", as: "answers" });

        Question.hasOne(Result, { foreignKey: "questionId", as: "result" });
    }
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
        isStudyingLanguage: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
