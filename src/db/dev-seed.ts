import { register } from "ts-node";

import { devSeeder } from "./umzug.ts";

register();

devSeeder.runAsCLI();
