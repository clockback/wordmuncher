import { test as setup } from "@playwright/test";
import { unlink } from "fs/promises";

import { pathToDB } from "../db/config/config.mjs";
import { devSeeder, migrator, seeder } from "../db/umzug";

setup("Set up database", async ({}) => {
    try {
        await unlink(pathToDB);
        console.log("Deleted existing database file.");
    } catch {
        console.log("No database file to delete.");
    }

    console.info(`Creating new database at "${pathToDB}".`);
    await migrator.up();
    await seeder.up();
    await devSeeder.up();
});
