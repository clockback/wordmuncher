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
    Category,
    InflectionAnswer,
    Question,
    SheetQuestion,
    TonguePair,
} from "@models";

import sequelize from "./db-connection";

export class Sheet extends Model<
    InferAttributes<Sheet, { omit: "tonguePair" | "category" }>,
    InferCreationAttributes<Sheet, { omit: "tonguePair" | "category" }>
> {
    declare id: CreationOptional<number>;

    declare sheetName: string;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair: NonAttribute<TonguePair>;

    declare categoryId: ForeignKey<Category["id"]> | null;
    declare category?: NonAttribute<Category>;

    declare questions?: NonAttribute<Question[]>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    async getQuestions(): Promise<Question[]> {
        return Question.findAll({
            include: [
                { model: SheetQuestion, where: { sheetId: this.id } },
                {
                    model: Answer,
                    as: "answers",
                    required: false,
                },
                {
                    model: InflectionAnswer,
                    as: "inflectionAnswers",
                    required: false,
                },
            ],
        });
    }

    static associate() {
        Sheet.hasMany(SheetQuestion, {
            foreignKey: "sheetId",
        });

        Sheet.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
        });

        Sheet.belongsTo(Category, {
            foreignKey: "categoryId",
            as: "category",
        });

        Sheet.belongsToMany(Question, {
            through: SheetQuestion,
            foreignKey: "sheetId",
            otherKey: "questionId",
            as: "questions",
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
        categoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Categories",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Sheet",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["sheetName", "tonguePairId"],
            },
        ],
    },
);
