import { getConnection } from './utils/connect.js';
import readQuery from './utils/readQuery.js';


async function getTranslators() {
    let db = await getConnection();

    let translators = await readQuery(db, `
        SELECT
            translator,
            from_l AS fromLanguage,
            l1.name AS fromLanguageName,
            f1.text AS fromLanguageFlag,
            to_l AS toLanguage,
            l2.name AS toLanguageName,
            f2.text AS toLanguageFlag
        FROM (
            SELECT translator, from_l, to_l FROM translators
            ORDER BY last_used DESC
            LIMIT 3
        )
        INNER JOIN languages AS l1
            ON l1.language = from_l
        INNER JOIN languages AS l2
            ON l2.language = to_l
        INNER JOIN flags AS f1
            ON l1.flag = f1.flag
        INNER JOIN flags AS f2
            ON l2.flag = f2.flag
    `, {});

    postMessage(translators);
}

getTranslators();
