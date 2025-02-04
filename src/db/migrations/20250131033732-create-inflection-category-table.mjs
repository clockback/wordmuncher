"use strict";

import { BOOLEAN, DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "InflectionCategories",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: INTEGER,
                },
                inflectionTypeId: {
                    type: INTEGER,
                    references: {
                        model: "InflectionTypes",
                        key: "id",
                    },
                    allowNull: false,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                categoryName: {
                    type: STRING,
                    allowNull: false,
                },
                isPrimary: {
                    type: BOOLEAN,
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
            "InflectionCategories",
            ["inflectionTypeId", "categoryName"],
            { unique: true, transaction: t },
        );
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex(
            "InflectionCategories",
            ["inflectionTypeId", "categoryName"],
            { transaction: t },
        );
        await queryInterface.dropTable("InflectionCategories", {
            transaction: t,
        });
    });
}
