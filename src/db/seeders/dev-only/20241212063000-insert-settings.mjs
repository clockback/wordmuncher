"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Settings", [
        {
            tonguePairId: 1,
            nativeTongueId: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.delete("Settings", null);
}
