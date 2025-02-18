"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("InflectionFeatures", [
        {
            inflectionCategoryId: 1,
            featureName: "Nominative",
            orderInCategory: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionCategoryId: 1,
            featureName: "Accusative",
            orderInCategory: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionCategoryId: 2,
            featureName: "Masculine",
            orderInCategory: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionCategoryId: 2,
            featureName: "Feminine",
            orderInCategory: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionCategoryId: 2,
            featureName: "Neuter",
            orderInCategory: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            inflectionCategoryId: 3,
            featureName: "Past",
            orderInCategory: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}

export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("InflectionFeatures", null);
}
