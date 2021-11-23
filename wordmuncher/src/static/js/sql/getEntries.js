import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


function findQueriesDecorator(queries) {
    for (let i = 0; i < queries.length; i ++) {
        queries[i] = queries[i].replaceAll("\u0301", "");
    }

    function findQueries(questionString, entriesString) {
        let checkString;

        let entries = JSON.parse(entriesString);

        if (Array.isArray(entries)) {
            checkString = entries.join(" ");
        }
        else if (typeof(Object.values(entries)) === "string") {
            checkString = Object.values(entries).join(" ");
        }
        else {
            let parts = Object.values(entries);
            results = [];
            for (let i = 0; i < parts.length; i ++) {
                results.push(Object.values(parts[i]).join(" "));
            }

            checkString = results.join(" ");
        }

        checkString += (" " + questionString).replaceAll("\u0301", "");

        for (let i = 0; i < queries; i ++) {
            if (!checkString.includes(queries[i])) {
                return false;
            }
        }

        return true;
    }

    return findQueries;
}


async function getEntries(msg) {
    let db = await getConnection();

    let parameters = {
        ":translator": msg.data.translator,
        ":offset": msg.data.offset ? msg.data.offset : 0
    };

    db.create_function(
        "find_queries", findQueriesDecorator(msg.data.searchQueries)
    );

    let entries = await readQuery(db, `
        SELECT
            entries.entry,
            question,
            json_extract(solutions, '$[0]') AS answer,
            COUNT(mentions.entry) AS mentions,
            points + (so_far == needed) AS stars
            FROM (
                SELECT
                    all_entries.entry,
                    solutions,
                    question,
                    points,
                    needed,
                    so_far
                    FROM entries AS all_entries
                WHERE find_queries(
                    all_entries.question, all_entries.solutions
                )
                AND all_entries.translator = :translator
                ORDER BY LOWER(all_entries.question)
                LIMIT 6 OFFSET :offset
            ) AS entries
        LEFT JOIN mentions ON mentions.entry = entries.entry
        GROUP BY entries.entry
        ORDER BY LOWER(entries.question)
    `, parameters);

    postMessage(entries);
}

self.onmessage = getEntries;
