"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.renameColumn(
                "Sheets",
                "tonguePair",
                "tonguePairId",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "Questions",
                "tonguePair",
                "tonguePairId",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "SheetQuestions",
                "sheet",
                "sheetId",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "SheetQuestions",
                "question",
                "questionId",
                { transaction: t },
            );
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.renameColumn(
                "Sheets",
                "tonguePairId",
                "tonguePair",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "Questions",
                "tonguePairId",
                "tonguePair",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "SheetQuestions",
                "sheetId",
                "sheet",
                { transaction: t },
            );
            await queryInterface.renameColumn(
                "SheetQuestions",
                "questionId",
                "question",
                { transaction: t },
            );
        });
    },
};
