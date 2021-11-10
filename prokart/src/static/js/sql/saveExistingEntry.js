import {getConnection} from './utils/connect.js';


async function saveExistingEntry(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        UPDATE entries SET
            question = ?,
            solutions = ?
        WHERE entry = ?
    `);
    stmt.run([
        msg.data.question, JSON.stringify(msg.data.solutions), msg.data.entry
    ]);
    stmt.free();

    stmt = db.prepare(`
        DELETE FROM mentions
        WHERE entry = ?
    `);
    stmt.run([msg.data.entry]);
    stmt.free();

    stmt = db.prepare(`
        INSERT INTO mentions (sheet, entry) VALUES (?, ?)
    `);

    for (let i = 0; i < msg.data.sheets.length; i ++) {
        stmt.run([msg.data.sheets[i], msg.data.entry]);
    }
    stmt.free();

    postMessage(true);
}

self.onmessage = saveExistingEntry;
