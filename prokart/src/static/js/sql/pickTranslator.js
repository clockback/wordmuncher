import { getConnection } from './utils/connect.js';


async function pickTranslator(msg) {
    let db = await getConnection();

    let stmt = db.prepare(`
        UPDATE translators
        SET last_used = datetime('now')
        WHERE from_l = ?
            AND to_l = ?;
    `);

    stmt.run([msg.data.fromLanguage, msg.data.toLanguage]);
    stmt.free();

    postMessage(true);
}

self.onmessage = pickTranslator;
