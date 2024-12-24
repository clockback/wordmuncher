"use strict";

const Sequelize = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.createTable(
                "Answers",
                {
                    id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: Sequelize.INTEGER,
                    },
                    questionId: {
                        type: Sequelize.INTEGER,
                        references: {
                            model: "Questions",
                            key: "id",
                        },
                        allowNull: false,
                        onDelete: "CASCADE",
                        onUpdate: "CASCADE",
                    },
                    isMainAnswer: {
                        allowNull: false,
                        type: Sequelize.BOOLEAN,
                    },
                    answerText: {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },
                    createdAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                    updatedAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                    },
                },
                {},
            );
            await queryInterface.addIndex(
                "Answers",
                ["questionId", "answerText"],
                {
                    unique: true,
                },
            );
        });
    },

    async down(queryInterface) {
        await queryInterface.sequelize.transaction(async (t) => {
            await queryInterface.removeIndex("Answers", [
                "questionId",
                "answerText",
            ]);
            await queryInterface.dropTable("Answers");
        });
    },
};
