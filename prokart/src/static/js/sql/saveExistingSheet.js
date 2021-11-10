import {getConnection} from './utils/connect.js';


async function saveExistingSheet(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        UPDATE sheets SET name=:name
        WHERE sheet = ?
    `);
    stmt.run([msg.data.name, msg.data.sheet]);
    stmt.free();

    stmt = db.prepare(`
        DELETE FROM mentions
        WHERE sheet = ?
    `);
    stmt.run([msg.data.sheet]);
    stmt.free();

    stmt = db.prepare(`
        INSERT INTO mentions (sheet, entry) VALUES (?, ?)
    `);

    for (let i = 0; i < msg.data.entries.length; i ++) {
        stmt.run([msg.data.sheet, msg.data.entries[i]]);
    }
    stmt.free();

    postMessage(true);
}

self.onmessage = saveExistingSheet;
