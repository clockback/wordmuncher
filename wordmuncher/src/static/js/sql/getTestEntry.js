import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getTestEntry(msg) {
    let db = await getConnection();

    let parameters = {
        ":sheet": msg.data.sheet
    };

    let lastEntriesCases = "";
    if (msg.data.lastEntries.length > 0) {
        lastEntriesCases += "CASE";
        for (let i = 0; i < msg.data.lastEntries.length; i ++) {
            lastEntriesCases += `
                WHEN entries.entry = :${i}
                    THEN ${msg.data.lastEntries.length - i}
            `;
            parameters[`:${i}`] = msg.data.lastEntries[i];
        }
        lastEntriesCases += "ELSE 0 END,"
    }

    let entry = await readQuery(db, `
        SELECT
            entries.entry,
            question,
            schema,
            solutions,
            points,
            needed,
            so_far AS soFar
        FROM sheets
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
            AND sheets.sheet=:sheet
        ORDER BY
        ${lastEntriesCases}
        CASE
            WHEN (needed > 2 OR so_far = 1) THEN 0
            WHEN (so_far = 0) THEN 1
            ELSE 2 END,
        RANDOM()
        LIMIT 1;
    `, parameters);

    postMessage(entry[0]);
}

self.onmessage = getTestEntry;
