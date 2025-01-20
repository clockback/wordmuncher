"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Sheets", [
        {
            sheetName: "Sheet 1",
            tonguePairId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            sheetName: "Sheet 2",
            tonguePairId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            sheetName: "Sheet 3",
            tonguePairId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("Sheets", null);
}
