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

    postMessage(true);
}

self.onmessage = saveNewEntry;
