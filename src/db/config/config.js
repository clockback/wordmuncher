import SQLite from "sqlite3";

const config = {
    development: {
        dialect: "sqlite",
        storage: "/tmp/wordmuncher.sqlite",
        dialectModule: SQLite,
    },
    test: {
        dialect: "sqlite",
        storage: "/tmp/wordmuncher.sqlite",
        dialectModule: SQLite,
    },
    production: {
        dialect: "sqlite",
        storage: "/tmp/wordmuncher.sqlite",
        dialectModule: SQLite,
    },
};

module.exports = config;
