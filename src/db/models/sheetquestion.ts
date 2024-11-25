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
import Sheet from "./sheet";
import Question from "./question";
import TonguePair from "./tonguepair";

class SheetQuestion extends Model<
    InferAttributes<SheetQuestion, { omit: "sheet" | "question" }>,
    InferCreationAttributes<SheetQuestion, { omit: "sheet" | "question" }>
> {
    declare id: CreationOptional<number>;

    declare sheetId: ForeignKey<Sheet["id"]>;
    declare sheet: NonAttribute<Sheet>;

    declare questionId: ForeignKey<Question["id"]>;
    declare question: NonAttribute<Question>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

SheetQuestion.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        sheetId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Sheets",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        questionId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Questions",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "SheetQuestion",
        timestamps: true,
    },
);

SheetQuestion.belongsTo(Sheet, {
    foreignKey: "sheetId",
});

SheetQuestion.belongsTo(Question, {
    foreignKey: "questionId",
});

Question.hasMany(SheetQuestion, {
    foreignKey: "questionId",
});

Question.belongsTo(TonguePair, {
    foreignKey: "tonguePairId",
});

Question.belongsToMany(Sheet, {
    through: SheetQuestion,
    foreignKey: "sheetId",
    as: "questionId",
});
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

export default SheetQuestion;
