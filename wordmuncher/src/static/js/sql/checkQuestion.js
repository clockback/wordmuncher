import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function checkSheetName(msg) {
    let db = await getConnection();

    let entries = await readQuery(db, `
        SELECT 1 AS alreadyExists FROM entries
        WHERE translator=:translator
            AND question=:question
    `, {":translator": msg.data.translator, ":question": msg.data.question});

    postMessage(entries.length == 0);
}

self.onmessage = checkSheetName;
