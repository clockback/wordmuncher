"use strict";

import { DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.createTable("Tongues", {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: INTEGER,
        },
        tongueName: {
            allowNull: false,
            type: STRING,
            unique: true,
        },
        flag: {
            allowNull: false,
            type: STRING,
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
    await queryInterface.dropTable("Tongues");
}
