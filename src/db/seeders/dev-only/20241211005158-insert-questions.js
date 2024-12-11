"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("Questions", [
            {
                questionText: "Question 1",
                answer: "Answer 1",
                tonguePairId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                questionText: "Question 2",
                answer: "Answer 2",
                tonguePairId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Questions", null);
    },
};
