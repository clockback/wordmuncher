/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        rules: {
            "*.svg": {
                loaders: ["@svgr/webpack"],
                as: "*.js",
            },
        },
    },
    serverExternalPackages: ["sequelize"],
};

export default nextConfig;
