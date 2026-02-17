"use strict";

import { BOOLEAN } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.addColumn("Settings", "ignoreDiacritics", {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true,
    });
}
export async function down({ context: queryInterface }) {
    await queryInterface.removeColumn("Settings", "ignoreDiacritics");
}
