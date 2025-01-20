import { Op } from "sequelize";

import sequelize from "../db/models/db-connection.js";

const dayDelay = {
    1: 1,
    2: 7,
    3: 30,
    4: 90,
};
const secondsInDay = 24 * 60 * 60 * 1000;

interface QIResult {
    id: number;
    stars: number;
    gotStarAt: string;
}

export async function updateResultStars() {
    const queryInterface = sequelize.getQueryInterface();
    const results = (await queryInterface.select(null, "Results", {
        where: {
            goal: 2,
            current: 2,
            stars: { [Op.lt]: 4 },
            gotStarAt: { [Op.ne]: null },
        },
    })) as QIResult[];
    const now = new Date();
    for (const result of results) {
        const { id, stars, gotStarAt } = result;

        // Calculate the days that have passed since completion.
        const gotStarAtDate = new Date(gotStarAt);
        const diffDays = Math.round(
            Math.abs((gotStarAtDate.valueOf() - now.valueOf()) / secondsInDay),
        );

        // Add another star to the word if enough time has passed since completion.
        if (diffDays >= dayDelay[stars + 1]) {
            console.log(`Promoting question ${id}.`);
            await queryInterface.bulkUpdate(
                "Results",
                { stars: stars + 1, current: 0, gotStarAt: null },
                { id: id },
            );
        }
    }
}
