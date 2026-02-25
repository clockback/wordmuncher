"use strict";

import { DataTypes } from "sequelize";

const { BOOLEAN } = DataTypes;

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.addColumn("Settings", "speechEnabled", {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true,
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.removeColumn("Settings", "speechEnabled");
}
