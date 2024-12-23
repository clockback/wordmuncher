"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
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
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("Questions", null);
    },
};
