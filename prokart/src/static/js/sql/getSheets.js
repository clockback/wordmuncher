import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getSheets(msg) {
    let db = await getConnection();

    let populatedOnly = (
        msg.data.populatedOnly ? msg.data.populatedOnly : false
    );

    let populatedGroup = populatedOnly ? `
        INNER JOIN mentions ON mentions.sheet = all_sheets.sheet
    ` : "";
    let populatedJoin = populatedOnly ? "GROUP BY all_sheets.sheet" : "";

    let parameters = {
        ":translator": msg.data.translator,
        ":offset": msg.data.offset ? msg.data.offset : 0
    };

    let searchQueries = "";
    if (msg.data.searchQueries !== undefined) {
        for (var i = 0; i < msg.data.searchQueries.length; i ++) {
            searchQueries += `
                AND all_sheets.name LIKE '%' || :p${i} || '%' ESCAPE ' '
            `;
            parameters[`:p${i}`] = msg.data.searchQueries[i];
        }
    }

    let translators = await readQuery(db, `
        SELECT
            sheets.sheet,
            name,
            IFNULL(CAST(
                100 * CAST(SUM(points) + COUNT(completed) AS FLOAT) / (
                    SUM(points) + COUNT(completed)
                        + SUM(needed - so_far != 0)
                ) AS INT
            ), 0) AS score,
            COUNT(entries.entry) AS noEntries
            FROM (
                SELECT all_sheets.sheet, name FROM sheets AS all_sheets
                ${populatedJoin}
                WHERE all_sheets.translator = (
                    SELECT translator FROM translators
                    ORDER BY last_used DESC
                    LIMIT 1
                )
                ${searchQueries}
                ${populatedGroup}
                ORDER BY LOWER(all_sheets.name)
                LIMIT 6 OFFSET :offset
            ) AS sheets
        LEFT JOIN mentions ON mentions.sheet = sheets.sheet
        LEFT JOIN entries ON mentions.entry = entries.entry
        GROUP BY sheets.sheet
        ORDER BY LOWER(sheets.name)
    `, parameters);

    postMessage(translators);
}

self.onmessage = getSheets;
