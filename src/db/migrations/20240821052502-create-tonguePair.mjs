"use strict";

import { DATE, INTEGER } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.createTable("TonguePairs", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: INTEGER,
        },
        nativeTongueId: {
            type: INTEGER,
            references: {
                model: "Tongues",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        studyingTongueId: {
            type: INTEGER,
            references: {
                model: "Tongues",
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
    await queryInterface.dropTable("TonguePairs");
}
