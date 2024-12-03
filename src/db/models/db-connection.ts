import { Sequelize } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";

import { options } from "../config/config.mjs";

const dbOptions = options;

const sequelize = new Sequelize(dbOptions as SequelizeOptions);

export default sequelize;
