import {
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from "sequelize";

import { Sheet, TonguePair } from "@models";

import sequelize from "./db-connection";

export class Category extends Model<
    InferAttributes<
        Category,
        { omit: "tonguePair" | "parentCategory" | "childCategories" | "sheets" }
    >,
    InferCreationAttributes<
        Category,
        { omit: "tonguePair" | "parentCategory" | "childCategories" | "sheets" }
    >
> {
    declare id: CreationOptional<number>;

    declare categoryName: string;

    declare tonguePairId: ForeignKey<TonguePair["id"]>;
    declare tonguePair?: NonAttribute<TonguePair>;

    declare parentCategoryId: ForeignKey<Category["id"]> | null;
    declare parentCategory?: NonAttribute<Category>;
    declare childCategories: NonAttribute<Category[]>;

    declare sheets: NonAttribute<Sheet[]>;

    declare depth: number;
    declare displayOrder: CreationOptional<number>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    static associate() {
        Category.belongsTo(TonguePair, {
            foreignKey: "tonguePairId",
            as: "tonguePair",
        });
        Category.belongsTo(Category, {
            foreignKey: "parentCategoryId",
            as: "parentCategory",
        });
        Category.hasMany(Category, {
            foreignKey: "parentCategoryId",
            as: "childCategories",
        });
        Category.hasMany(Sheet, {
            foreignKey: "categoryId",
            as: "sheets",
        });
    }
}

Category.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        categoryName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tonguePairId: {
            type: DataTypes.INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        parentCategoryId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Categories",
                key: "id",
            },
            allowNull: true,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        depth: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    },
    {
        sequelize,
        modelName: "Category",
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ["categoryName", "tonguePairId", "parentCategoryId"],
            },
            { fields: ["tonguePairId"] },
            { fields: ["parentCategoryId"] },
        ],
    },
);
