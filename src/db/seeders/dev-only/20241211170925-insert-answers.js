"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
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
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Answers", null);
    },
};
