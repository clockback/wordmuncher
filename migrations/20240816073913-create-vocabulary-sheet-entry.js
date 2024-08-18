"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("vocabulary-sheet-entry", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            vocabulary_sheet: {
                type: Sequelize.INTEGER,
                references: {
                    model: "vocabulary-sheet",
                    key: "id",
                    deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            vocabulary_entry: {
                type: Sequelize.INTEGER,
                references: {
                    model: "vocabulary-entry",
                    key: "id",
                    deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE,
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("vocabulary-sheet-entry");
    },
};
