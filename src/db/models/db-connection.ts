import { Sequelize } from "sequelize";
import { SequelizeOptions } from "sequelize-typescript";

import options from "../config/config.mjs";

const sequelize = new Sequelize(options as SequelizeOptions);

export default sequelize;
