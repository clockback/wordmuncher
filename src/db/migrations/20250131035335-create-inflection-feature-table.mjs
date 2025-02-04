"use strict";

import { DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "InflectionFeatures",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: INTEGER,
                },
                inflectionCategoryId: {
                    type: INTEGER,
                    references: {
                        model: "InflectionCategories",
                        key: "id",
                    },
                    allowNull: false,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                featureName: {
                    type: STRING,
                    allowNull: false,
                },
                orderInCategory: {
                    type: INTEGER,
                    allowNull: false,
                },
                createdAt: {
                    allowNull: false,
                    type: DATE,
                },
                updatedAt: {
                    allowNull: false,
                    type: DATE,
                },
            },
            { transaction: t },
        );
        await queryInterface.addIndex(
            "InflectionFeatures",
            ["inflectionCategoryId", "featureName"],
            { unique: true, transaction: t },
        );
        await queryInterface.addIndex(
            "InflectionFeatures",
            ["inflectionCategoryId", "orderInCategory"],
            { unique: true, transaction: t },
        );
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex(
            "InflectionFeatures",
            ["inflectionCategoryId", "orderInCategory"],
            { transaction: t },
        );
        await queryInterface.removeIndex(
            "InflectionFeatures",
            ["inflectionCategoryId", "featureName"],
            { transaction: t },
        );
        await queryInterface.dropTable("InflectionFeatures", {
            transaction: t,
        });
    });
}
