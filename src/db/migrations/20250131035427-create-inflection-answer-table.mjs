"use strict";

import { DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "InflectionAnswers",
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
                primaryFeatureId: {
                    type: INTEGER,
                    references: {
                        model: "InflectionFeatures",
                        key: "id",
                    },
                    allowNull: false,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                secondaryFeatureId: {
                    type: INTEGER,
                    references: {
                        model: "InflectionFeatures",
                        key: "id",
                    },
                    allowNull: true,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
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
            { transaction: t },
        );
        await queryInterface.addIndex(
            "InflectionAnswers",
            ["questionId", "primaryFeatureId", "secondaryFeatureId"],
            { unique: true, transaction: t },
        );
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex(
            "InflectionAnswers",
            ["questionId", "primaryFeatureId", "secondaryFeatureId"],
            { transaction: t },
        );
        await queryInterface.dropTable("InflectionAnswers", { transaction: t });
    });
}
