export const options = {
    dialect: "sqlite",
    storage: "/tmp/wordmuncher.sqlite",
};

export default {
    development: options,
    test: options,
    production: options,
};
