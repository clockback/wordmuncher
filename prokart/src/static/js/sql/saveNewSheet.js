import { getConnection } from './utils/connect.js';


async function saveNewSheet(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        INSERT INTO sheets (translator, name) VALUES (?, ?)
    `);

    stmt.run([msg.data.translator, msg.data.name]);
    stmt.free();

    stmt = db.prepare(`
        INSERT INTO mentions (sheet, entry)
            SELECT sheet, ?
            FROM sheets
            WHERE translator = ?
                AND name = ?
    `);

    for (let i = 0; i < msg.data.entries.length; i ++) {
        stmt.run([msg.data.entries[i], msg.data.translator, msg.data.name]);
    }
    stmt.free();

    postMessage(true);
}

self.onmessage = saveNewSheet;
