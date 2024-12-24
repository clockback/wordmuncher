"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert("Tongues", [
            {
                tongueName: "English",
                flag: "🇬🇧",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Chinese",
                flag: "🇨🇳",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "French",
                flag: "🇫🇷",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "German",
                flag: "🇩🇪",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Hindi",
                flag: "🇮🇳",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Italian",
                flag: "🇮🇹",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Japanese",
                flag: "🇯🇵",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Korean",
                flag: "🇰🇷",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Russian",
                flag: "🇷🇺",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                tongueName: "Spanish",
                flag: "🇪🇸",
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("Tongues", null);
    },
};
