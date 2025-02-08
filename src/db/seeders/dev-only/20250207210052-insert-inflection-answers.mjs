"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("InflectionAnswers", [
        {
            questionId: 4,
            primaryFeatureId: 1,
            secondaryFeatureId: 3,
            answerText: "a",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 4,
            primaryFeatureId: 2,
            secondaryFeatureId: 3,
            answerText: "b",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 4,
            primaryFeatureId: 1,
            secondaryFeatureId: 4,
            answerText: "c",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 4,
            primaryFeatureId: 1,
            secondaryFeatureId: 5,
            answerText: "d",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            questionId: 5,
            primaryFeatureId: 6,
            answerText: "went",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}

export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("InflectionAnswers", null);
}
