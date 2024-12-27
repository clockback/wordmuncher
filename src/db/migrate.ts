import { register } from "ts-node";

import { migrator } from "./umzug.ts";

register();

migrator.runAsCLI();
