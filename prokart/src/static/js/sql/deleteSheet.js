import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function deleteSheet(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        DELETE FROM sheets
        WHERE sheet = ?
    `);

    stmt.run([msg.data.sheet]);
    stmt.free();

    let mentions = await readQuery(db, `
        SELECT mentions.entry FROM mentions
        WHERE mentions.sheet=:sheet
    `, {":sheet": msg.data.sheet});

    let updateMentions = []

    for (let i = 0; i < mentions.length; i ++) {
        if (msg.data.entries.includes(mentions[i].entry)) {
            updateMentions.push(mentions[i].entry);
        }
    }

    stmt = db.prepare(`
        DELETE FROM mentions
        WHERE sheet = ?
    `);

    stmt.run([msg.data.sheet]);
    stmt.free();

    postMessage(updateMentions);
}

self.onmessage = deleteSheet;
