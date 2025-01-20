"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Results", [
        {
            questionId: 1,
            stars: 1,
            goal: 2,
            current: 1,
            gotStarAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 2,
            stars: 4,
            goal: 2,
            current: 2,
            gotStarAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 3,
            stars: 2,
            goal: 2,
            current: 2,
            gotStarAt: new Date("2024-01-01 00:00:00 +00:00"),
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.delete("Results", null);
}
