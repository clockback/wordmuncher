"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addIndex("Sheets", ["sheetName", "tonguePairId"], {
            unique: true,
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeIndex("Sheets", ["sheetName", "tonguePairId"]);
    },
};
