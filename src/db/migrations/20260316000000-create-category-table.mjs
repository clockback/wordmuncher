"use strict";

import { DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "Categories",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: INTEGER,
                },
                categoryName: {
                    type: STRING,
                    allowNull: false,
                },
                tonguePairId: {
                    type: INTEGER,
                    references: {
                        model: "TonguePairs",
                        key: "id",
                    },
                    allowNull: false,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                parentCategoryId: {
                    type: INTEGER,
                    references: {
                        model: "Categories",
                        key: "id",
                    },
                    allowNull: true,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                depth: {
                    type: INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                displayOrder: {
                    type: INTEGER,
                    allowNull: false,
                    defaultValue: 0,
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
            "Categories",
            ["categoryName", "tonguePairId", "parentCategoryId"],
            { unique: true, transaction: t },
        );
        await queryInterface.addIndex("Categories", ["tonguePairId"], {
            transaction: t,
        });
        await queryInterface.addIndex("Categories", ["parentCategoryId"], {
            transaction: t,
        });
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex(
            "Categories",
            ["categoryName", "tonguePairId", "parentCategoryId"],
            { transaction: t },
        );
        await queryInterface.removeIndex("Categories", ["tonguePairId"], {
            transaction: t,
        });
        await queryInterface.removeIndex("Categories", ["parentCategoryId"], {
            transaction: t,
        });
        await queryInterface.dropTable("Categories", { transaction: t });
    });
}
