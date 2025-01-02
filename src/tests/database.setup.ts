import { test as setup } from "@playwright/test";
import { unlink } from "fs/promises";

import { devSeeder, migrator, seeder } from "../db/umzug";

setup("Set up database", async ({}) => {
    try {
        await unlink("/tmp/wordmuncher.sqlite");
        console.log("Deleted existing database file.");
    } catch (e) {
        console.log("No database file to delete.");
    }

    console.info("Creating new database!");
    await migrator.up();
    await seeder.up();
    await devSeeder.up();
});
