"use strict";

import { INTEGER } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.addColumn("Settings", "nativeTongueId", {
        type: INTEGER,
        references: {
            model: "Tongues",
            key: "id",
        },
        allowNull: true,
        onUpdate: "CASCADE",
    });

    // Backfill nativeTongueId from the existing tongue pair,
    // falling back to English (id 1) if no tongue pair exists.
    await queryInterface.sequelize.query(`
        UPDATE Settings
        SET nativeTongueId = COALESCE(
            (
                SELECT TonguePairs.nativeTongueId
                FROM TonguePairs
                WHERE TonguePairs.id = Settings.tonguePairId
            ),
            1
        )
        WHERE Settings.nativeTongueId IS NULL
    `);
}
export async function down({ context: queryInterface }) {
    await queryInterface.removeColumn("Settings", "nativeTongueId");
}
