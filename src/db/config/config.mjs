export const options = {
    dialect: "sqlite",
    storage: "/tmp/wordmuncher.sqlite",
    logging: false,
};

export default {
    development: options,
    test: options,
    production: options,
};
