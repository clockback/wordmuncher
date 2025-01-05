"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Results", [
        {
            questionId: 1,
            stars: 1,
            goal: 2,
            current: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 2,
            stars: 3,
            goal: 2,
            current: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.delete("Results", null);
}
