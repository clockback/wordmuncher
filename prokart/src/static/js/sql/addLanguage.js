import { getConnection } from './utils/connect.js';


async function addLanguage(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        INSERT INTO languages (name, flag) VALUES
            (
                ?,
                (SELECT flag FROM flags WHERE text = ?)
            )
    `);

    stmt.run([msg.data.languageName, msg.data.flag]);
    stmt.free();

    postMessage(true);
}

self.onmessage = addLanguage;
