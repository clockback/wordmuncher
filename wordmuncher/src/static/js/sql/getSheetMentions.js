import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getSheetMentions(msg) {
    let db = await getConnection();

    let sheetObjects = await readQuery(db, `
        SELECT entry FROM mentions
        WHERE sheet=:sheet
    `, {":sheet": msg.data.sheet});

    let sheets = [];
    for (let i = 0; i < sheetObjects.length; i ++) {
        sheets.push(sheetObjects[i].entry);
    }

    postMessage(sheets);
}

self.onmessage = getSheetMentions;
