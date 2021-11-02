import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getLanguages() {
    let db = await getConnection();

    let languages = await readQuery(db, `
        SELECT name, text FROM languages
        INNER JOIN flags ON languages.flag = flags.flag
        ORDER BY name
    `, {});

    postMessage(languages);
}

getLanguages();
