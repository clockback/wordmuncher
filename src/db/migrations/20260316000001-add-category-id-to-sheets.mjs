"use strict";

import { INTEGER } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.addColumn(
            "Sheets",
            "categoryId",
            {
                type: INTEGER,
                references: {
                    model: "Categories",
                    key: "id",
                },
                allowNull: true,
                onDelete: "SET NULL",
                onUpdate: "CASCADE",
            },
            { transaction: t },
        );
        await queryInterface.addIndex("Sheets", ["categoryId"], {
            transaction: t,
        });
    });
}

export async function down({ context: queryInterface }) {
    await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.removeIndex("Sheets", ["categoryId"], {
            transaction: t,
        });
        await queryInterface.removeColumn("Sheets", "categoryId", {
            transaction: t,
        });
    });
}
