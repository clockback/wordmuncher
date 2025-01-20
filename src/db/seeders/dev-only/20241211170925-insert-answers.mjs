"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Answers", [
        {
            questionId: 1,
            isMainAnswer: true,
            answerText: "hello world",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 1,
            isMainAnswer: false,
            answerText: "hello",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 2,
            isMainAnswer: true,
            answerText: "why",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 3,
            isMainAnswer: true,
            answerText: "What's up?",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("Answers", null);
}
