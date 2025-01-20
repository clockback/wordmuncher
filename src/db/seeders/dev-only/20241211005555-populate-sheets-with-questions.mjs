"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("SheetQuestions", [
        {
            sheetId: 1,
            questionId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            sheetId: 1,
            questionId: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            sheetId: 3,
            questionId: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("SheetQuestions", null);
}
