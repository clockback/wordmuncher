import { getConnection } from './utils/connect.js';


async function saveNewSheet(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        INSERT INTO sheets (translator, name) VALUES (?, ?)
    `);

    stmt.run([msg.data.translator, msg.data.name]);
    stmt.free();

    postMessage(true);
}

self.onmessage = saveNewSheet;
