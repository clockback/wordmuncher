import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function findFlags() {
    let db = await getConnection();

    let results = await readQuery(db, `
        SELECT text, country FROM flags ORDER BY country
    `, {});

    postMessage(results);
}

findFlags();
