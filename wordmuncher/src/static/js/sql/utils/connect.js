import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';


async function getConnection() {
    let SQL = await initSqlJs({ locateFile: file => file });
    let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
    SQL.register_for_idb(sqlFS);

    SQL.FS.mkdir('/sql');
    SQL.FS.mount(sqlFS, {}, '/sql');

    let db = new SQL.Database('/sql/db.sqlite', { filename: true });
    db.exec(`
        PRAGMA page_size=8192;
        PRAGMA journal_mode=MEMORY;
    `);
    return db;
}

export { getConnection };
