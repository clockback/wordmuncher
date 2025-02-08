"use strict";

import { DATE, INTEGER, STRING } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.createTable(
            "InflectionTypes",
            {
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
                    allowNull: false,
                    onDelete: "CASCADE",
                    onUpdate: "CASCADE",
                },
                typeName: {
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
            "InflectionTypes",
            ["tonguePairId", "typeName"],
            { unique: true, transaction: t },
        );
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex(
            "InflectionTypes",
            ["tonguePairId", "typeName"],
            { transaction: t },
        );
        await queryInterface.dropTable("InflectionTypes", { transaction: t });
    });
}
