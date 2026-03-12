"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.addIndex("SheetQuestions", ["sheetId", "questionId"], {
        unique: true,
        name: "sheet_question_unique",
    });

    await queryInterface.addIndex("SheetQuestions", ["questionId"], {
        name: "sheet_question_question_id",
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.removeIndex("SheetQuestions", "sheet_question_unique");
    await queryInterface.removeIndex(
        "SheetQuestions",
        "sheet_question_question_id",
    );
}
