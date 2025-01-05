"use strict";

import { DATE, INTEGER } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "Results",
            {
                id: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: INTEGER,
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
                    unique: true,
                },
                stars: {
                    allowNull: false,
                    type: INTEGER,
                },
                goal: {
                    allowNull: false,
                    type: INTEGER,
                },
                current: {
                    allowNull: false,
                    type: INTEGER,
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
            {},
        );
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.dropTable("Results");
}
