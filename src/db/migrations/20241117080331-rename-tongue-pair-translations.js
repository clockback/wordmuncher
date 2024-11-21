"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.renameColumn(
                "TonguePairs",
                "translateFrom",
                "translateFromTongueId",
            );
            await queryInterface.renameColumn(
                "TonguePairs",
                "translateTo",
                "translateToTongueId",
            );
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.renameColumn(
                "TonguePairs",
                "translateFromTongueId",
                "translateFrom",
            );
            await queryInterface.renameColumn(
                "TonguePairs",
                "translateToTongueId",
                "translateTo",
            );
        });
    },
};
