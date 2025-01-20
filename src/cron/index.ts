import { scheduleJob } from "node-schedule";

import { updateResultStars } from "./update-db.ts";

scheduleJob("0 0 * * * *", updateResultStars);
