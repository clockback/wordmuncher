"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("tongue-pair", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            translate_from: {
                type: Sequelize.INTEGER,
                references: {
                    model: "tongue",
                    key: "id",
                },
                allowNull: false,
                onDelete: "CASCADE",
                onUpdate: "CASCADE",
            },
            translate_to: {
                type: Sequelize.INTEGER,
                references: {
                    model: "tongue",
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
        await queryInterface.dropTable("tongue-pair");
    },
};
