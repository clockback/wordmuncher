"use strict";

import { getConnection } from './connect.js';


async function getTranslators() {
    let db = await getConnection();
    let translators = [];

    let stmt = db.prepare(`
    SELECT from_l, l1.name, f1.text, to_l, l2.name, f2.text FROM (
            SELECT from_l, to_l FROM translators
            ORDER BY last_used DESC
            LIMIT 3
        )
        INNER JOIN languages AS l1
            ON l1.language = from_l
        INNER JOIN languages AS l2
            ON l2.language = to_l
        INNER JOIN flags AS f1
            ON l1.flag = f1.flag
        INNER JOIN flags AS f2
            ON l2.flag = f2.flag
    `);

    stmt.step();
    let row = stmt.getAsObject();
    while (row.name) {
        translators.push(row);
        stmt.step();
        row = stmt.getAsObject();
    }
    stmt.free();

    postMessage(translators);
}

getTranslators();
