import {getConnection} from './utils/connect.js';


async function markEntryIncorrect(msg) {
    let db = await getConnection();

    let needed = msg.data.needed;
    let soFar = msg.data.soFar;

    let stmt = db.prepare(`
        UPDATE entries
            SET needed = ?, so_far = ?, completed = NULL
        WHERE entry = ?;
    `);
    stmt.run([needed, soFar, msg.data.entry]);
    stmt.free();

    postMessage(true);
}

self.onmessage = markEntryIncorrect;
