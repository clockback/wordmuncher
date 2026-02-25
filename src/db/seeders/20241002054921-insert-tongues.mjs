"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up({ context: queryInterface }) {
    await queryInterface.bulkInsert("Tongues", [
        {
            tongueName: "English",
            flag: "🇬🇧",
            languageCode: "en",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Chinese",
            flag: "🇨🇳",
            languageCode: "zh",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "French",
            flag: "🇫🇷",
            languageCode: "fr",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "German",
            flag: "🇩🇪",
            languageCode: "de",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Hindi",
            flag: "🇮🇳",
            languageCode: "hi",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Italian",
            flag: "🇮🇹",
            languageCode: "it",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Japanese",
            flag: "🇯🇵",
            languageCode: "ja",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Korean",
            flag: "🇰🇷",
            languageCode: "ko",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Russian",
            flag: "🇷🇺",
            languageCode: "ru",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            tongueName: "Spanish",
            flag: "🇪🇸",
            languageCode: "es",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);
}
export async function down({ context: queryInterface }) {
    await queryInterface.bulkDelete("Tongues", null);
}
