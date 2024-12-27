import { register } from "ts-node";

import { seeder } from "./umzug.ts";

register();

seeder.runAsCLI();
