"use strict";

import { BOOLEAN, DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "Answers",
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
                },
                isMainAnswer: {
                    allowNull: false,
                    type: BOOLEAN,
                },
                answerText: {
                    type: STRING,
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
            {
                transaction: t,
            },
        );
        await queryInterface.addIndex("Answers", ["questionId", "answerText"], {
            unique: true,
            transaction: t,
        });
    });
}
export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex(
            "Answers",
            ["questionId", "answerText"],
            { transaction: t },
        );
        await queryInterface.dropTable("Answers", { transaction: t });
    });
}
