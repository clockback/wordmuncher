export const options = {
    dialect: "sqlite",
    storage: "/tmp/wordmuncher.sqlite",
    logging: false,
};

const allOptions = {
    development: options,
    test: options,
    production: options,
};

export default allOptions;
