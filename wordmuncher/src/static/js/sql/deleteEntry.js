import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function deleteEntry(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        DELETE FROM entries
        WHERE entry = ?
    `);

    stmt.run([msg.data.entry]);
    stmt.free();

    let mentions = await readQuery(db, `
        SELECT mentions.sheet FROM mentions
        WHERE mentions.entry=:entry
    `, {":entry": msg.data.entry});

    let updateMentions = []

    for (let i = 0; i < mentions.length; i ++) {
        if (msg.data.sheets.includes(mentions[i].sheet)) {
            updateMentions.push(mentions[i].sheet);
        }
    }

    stmt = db.prepare(`
        DELETE FROM mentions
        WHERE entry = ?
    `);

    stmt.run([msg.data.entry]);
    stmt.free();

    postMessage(updateMentions);
}

self.onmessage = deleteEntry;
