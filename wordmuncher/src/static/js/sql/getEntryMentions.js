import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getEntryMentions(msg) {
    let db = await getConnection();

    let entryObjects = await readQuery(db, `
        SELECT sheet FROM mentions
        WHERE entry=:entry
    `, {":entry": msg.data.entry});

    let entries = [];
    for (let i = 0; i < entryObjects.length; i ++) {
        entries.push(entryObjects[i].sheet);
    }

    postMessage(entries);
}

self.onmessage = getEntryMentions;
