import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getSchemas(msg) {
    let db = await getConnection();

    let schemas = await readQuery(db, `
        SELECT schema, name FROM schemas
        WHERE translator=:translator
    `, {":translator": msg.data.translator});

    postMessage(schemas);
}

self.onmessage = getSchemas;
