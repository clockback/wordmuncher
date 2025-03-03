import fs from "fs";
import os from "os";
import path from "path";

const homedir = os.homedir();
export const pathToDataDir = path.join(
    homedir,
    ".local",
    "share",
    "wordmuncher",
);

if (process.env.NODE_ENV == "production" && !fs.existsSync(pathToDataDir)) {
    fs.mkdirSync(pathToDataDir, { recursive: true });
}

export let pathToDB;
if (process.env.NODE_ENV == "production") {
    pathToDB = path.join(pathToDataDir, "wordmuncher.sqlite");
} else {
    pathToDB = "/tmp/wordmuncher.sqlite";
}

const options = { dialect: "sqlite", logging: false, storage: pathToDB };
export default options;
