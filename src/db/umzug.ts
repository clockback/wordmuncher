import { dirname } from "path";
import { SequelizeStorage, Umzug } from "umzug";
import { fileURLToPath } from "url";

import sequelize from "./models/db-connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const migrator = new Umzug({
    migrations: { glob: ["migrations/*.mjs", { cwd: __dirname }] },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

export type Migration = typeof migrator._types.migration;

export const seeder = new Umzug({
    migrations: { glob: ["seeders/*.mjs", { cwd: __dirname }] },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

export type Seed = typeof seeder._types.migration;

export const devSeeder = new Umzug({
    migrations: { glob: ["seeders/dev-only/*.mjs", { cwd: __dirname }] },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
});

export type DevSeed = typeof devSeeder._types.migration;
