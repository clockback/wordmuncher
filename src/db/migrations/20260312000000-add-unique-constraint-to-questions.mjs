"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.addIndex(
        "Questions",
        ["tonguePairId", "questionText"],
        {
            unique: true,
            name: "question_tongue_pair_text_unique",
        },
    );
}

export async function down({ context: queryInterface }) {
    await queryInterface.removeIndex(
        "Questions",
        "question_tongue_pair_text_unique",
    );
}
