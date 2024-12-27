"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Questions", [
        {
            questionText: "Question 1",
            tonguePairId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionText: "Question 2",
            tonguePairId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("Questions", null);
}
