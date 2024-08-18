"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("vocabulary-sheet", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            tongue_pair: {
                type: Sequelize.INTEGER,
                references: {
                    model: "tongue-pair",
                    key: "id",
                    deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            vocabulary_sheet_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("vocabulary-sheet");
    },
};
