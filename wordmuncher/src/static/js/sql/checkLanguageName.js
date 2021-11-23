import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function checkLanguageName(msg) {
    let db = await getConnection();

    let results = await readQuery(db, `
        SELECT 1 AS foundLanguage FROM languages
        WHERE name=:name
    `, {':name': msg.data});

    postMessage(results.length == 0);
}

self.onmessage = checkLanguageName;
