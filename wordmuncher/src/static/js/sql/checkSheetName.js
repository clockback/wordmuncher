import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function checkSheetName(msg) {
    let db = await getConnection();

    let sheets = await readQuery(db, `
        SELECT 1 AS alreadyExists FROM sheets
        WHERE translator=:translator
            AND name=:name
    `, {":translator": msg.data.translator, ":name": msg.data.name});

    postMessage(sheets.length == 0);
}

self.onmessage = checkSheetName;
