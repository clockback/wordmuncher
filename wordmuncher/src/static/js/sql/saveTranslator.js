import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function saveTranslator(msg) {
    let db = await getConnection();

    let fromLanguageID = await readQuery(db, `
        SELECT language FROM languages WHERE name=:fromLanguage
    `, {':fromLanguage': msg.data.fromLanguage});

    let toLanguageID = await readQuery(db, `
        SELECT language FROM languages WHERE name=:toLanguage
    `, {':toLanguage': msg.data.toLanguage});

    let stmt = db.prepare(`
        INSERT INTO translators
            (from_l, to_l)
        SELECT ?, ?
        WHERE NOT EXISTS (
            SELECT 1 FROM translators
            WHERE from_l = ?
                AND to_l = ?
        )
    `);

    stmt.run([
        fromLanguageID[0].language, toLanguageID[0].language,
        fromLanguageID[0].language, toLanguageID[0].language
    ]);
    stmt.free();


    stmt = db.prepare(`
        UPDATE translators
        SET last_used = datetime('now')
        WHERE from_l = ?
            AND to_l = ?;
    `);

    stmt.run([
        fromLanguageID[0].language, toLanguageID[0].language,
    ]);
    stmt.free();

    postMessage(true);
}

self.onmessage = saveTranslator;
