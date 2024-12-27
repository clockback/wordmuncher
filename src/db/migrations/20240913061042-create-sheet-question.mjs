"use strict";

import { DATE, INTEGER } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.createTable("SheetQuestions", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: INTEGER,
        },
        sheetId: {
            type: INTEGER,
            references: {
                model: "Sheets",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        questionId: {
            type: INTEGER,
            references: {
                model: "Questions",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        createdAt: {
            allowNull: false,
            type: DATE,
        },
        updatedAt: {
            allowNull: false,
            type: DATE,
        },
    });
}
export async function down({ context: queryInterface }) {
    await queryInterface.dropTable("SheetQuestions");
}
