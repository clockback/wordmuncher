"use strict";

import { DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.createTable("Sheets", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: INTEGER,
        },
        sheetName: {
            type: STRING,
            allowNull: false,
            unique: true,
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
    await queryInterface.dropTable("Sheets");
}
