"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("InflectionCategories", [
        {
            inflectionTypeId: 1,
            categoryName: "Case",
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionTypeId: 1,
            categoryName: "Gender",
            isPrimary: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionTypeId: 2,
            categoryName: "Tense",
            isPrimary: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}

export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("InflectionCategories", null);
}
