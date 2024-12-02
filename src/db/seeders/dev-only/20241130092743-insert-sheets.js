"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert("Sheets", [
            {
                sheetName: "Sheet 1",
                tonguePairId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                sheetName: "Sheet 2",
                tonguePairId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Sheets", null);
    },
};
