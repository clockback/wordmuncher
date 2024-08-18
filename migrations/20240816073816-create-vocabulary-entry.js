"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("vocabulary-entry", {
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
            prompt: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            answer: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            mastery_level: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            correct_answers_needed: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            correct_answers_given: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("vocabulary-entry");
    },
};
