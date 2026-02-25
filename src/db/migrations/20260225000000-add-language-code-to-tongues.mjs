"use strict";

import { DataTypes } from "sequelize";

const { STRING } = DataTypes;

const LANGUAGE_CODES = {
    English: "en",
    Chinese: "zh",
    French: "fr",
    German: "de",
    Hindi: "hi",
    Italian: "it",
    Japanese: "ja",
    Korean: "ko",
    Russian: "ru",
    Spanish: "es",
};

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.addColumn("Tongues", "languageCode", {
        type: STRING,
        allowNull: true,
    });

    for (const [name, code] of Object.entries(LANGUAGE_CODES)) {
        await queryInterface.sequelize.query(
            `UPDATE Tongues SET languageCode = '${code}' WHERE tongueName = '${name}'`,
        );
    }
}

export async function down({ context: queryInterface }) {
    await queryInterface.removeColumn("Tongues", "languageCode");
}
