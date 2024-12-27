"use strict";

import { DATE, INTEGER } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.createTable("Settings", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: INTEGER,
        },
        tonguePairId: {
            type: INTEGER,
            references: {
                model: "TonguePairs",
                key: "id",
            },
            allowNull: true,
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
    await queryInterface.dropTable("Settings");
}
