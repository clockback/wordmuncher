"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("InflectionTypes", [
        {
            tonguePairId: 1,
            typeName: "Nouns",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tonguePairId: 1,
            typeName: "Verbs",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}

export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("InflectionTypes", null);
}
