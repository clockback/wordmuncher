"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Questions", "answer");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("Questions", "answer", {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
