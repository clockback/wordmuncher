import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function addAnswer(msg) {
    let db = await getConnection();

    let stringSolutions = await readQuery(db, `
        SELECT solutions FROM entries
        WHERE entry=:entry
        LIMIT 1
    `, {':entry': msg.data.entry});

    let solutions = JSON.parse(stringSolutions[0].solutions);
    solutions.push(msg.data.answer);
    stringSolutions = JSON.stringify(solutions);

    let stmt = db.prepare(`
        UPDATE entries
        SET solutions = ?
        WHERE entry = ?
    `);

    stmt.run([stringSolutions, msg.data.entry]);
    stmt.free();

    postMessage(true);
}

self.onmessage = addAnswer;
