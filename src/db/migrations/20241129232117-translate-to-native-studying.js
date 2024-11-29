"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.renameColumn(
                "TonguePairs",
                "translateFromTongueId",
                "nativeTongueId",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "TonguePairs",
                "translateToTongueId",
                "studyingTongueId",
                { transaction: t },
            );
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.renameColumn(
                "TonguePairs",
                "nativeTongueId",
                "translateFromTongueId",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "TonguePairs",
                "studyingTongueId",
                "translateToTongueId",
                { transaction: t },
            );
        });
    },
};
