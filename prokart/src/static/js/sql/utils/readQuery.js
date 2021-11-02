import { getConnection } from './connect.js';


async function readQuery(db, query, params) {
    let results = [];

    let stmt = db.prepare(query);
    let result = stmt.getAsObject(params);

    while (result[Object.keys(result)[0]] !== undefined) {
        results.push(result);
        stmt.step();
        result = stmt.getAsObject();
    }
    stmt.free();

    return results;
}

export default readQuery;
