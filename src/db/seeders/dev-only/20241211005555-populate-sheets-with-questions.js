"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
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
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("SheetQuestions", null);
    },
};
