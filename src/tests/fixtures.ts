import { test as base } from "@playwright/test";

import sequelize from "../db/models/db-connection.js";
import { devSeeder, migrator, seeder } from "../db/umzug";

export const test = base.extend({
    page: async ({ page }, applyFixture) => {
        await sequelize.getQueryInterface().dropAllTables();
        await migrator.up();
        await seeder.up();
        await devSeeder.up();
        await applyFixture(page);
    },
});

export { expect } from "@playwright/test";
