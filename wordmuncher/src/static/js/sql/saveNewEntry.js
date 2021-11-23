import { getConnection } from './utils/connect.js';


async function saveNewEntry(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        INSERT INTO entries (translator, schema, question, solutions) VALUES
            (?, ?, ?, ?)
    `);

    stmt.run([
        msg.data.translator,
        msg.data.schema,
        msg.data.question,
        JSON.stringify(msg.data.solutions)
    ]);
    stmt.free();

    stmt = db.prepare(`
        INSERT INTO mentions (sheet, entry)
            SELECT ?, entry
            FROM entries
            WHERE translator = ?
                AND question = ?
            LIMIT 1
    `);

    for (let i = 0; i < msg.data.sheets.length; i ++) {
        stmt.run([msg.data.sheets[i], msg.data.translator, msg.data.question]);
    }
    stmt.free();

    postMessage(true);
}

self.onmessage = saveNewEntry;
