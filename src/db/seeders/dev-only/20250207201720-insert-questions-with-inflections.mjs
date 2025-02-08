"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Questions", [
        {
            questionText: "Question 4",
            tonguePairId: 1,
            inflectionTypeId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionText: "Question 5",
            tonguePairId: 1,
            inflectionTypeId: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("Questions", null);
}
