from itertools import chain, repeat
import json
from typing import Dict, List, Optional, Set, Tuple


from flask import render_template, redirect, request, url_for


from prokart.src.application import app
from prokart.src.modules.sql_handler import (
    escape, get_connection, get_recent_translations, last_insert_rowid,
    max_rows
)
from prokart.src.modules.sheets import get_sheets


def get_entries(searches: Optional[Set[str]] = None, offset: int = 0) -> List:
    conn = get_connection()

    # Constructs the part of the query that filters the searches.
    search_queries = "\n".join(
        "AND all_entries.question LIKE '%' || ? || '%' ESCAPE ' '"
        for _search in searches
    ) if searches else ""

    return list(conn.execute(
        f"""
        SELECT
            question,
            answer,
            COUNT(mentions.entry),
            points + (so_far == 2)
            FROM (
                SELECT
                    all_entries.entry,
                    solutions.text AS answer,
                    question,
                    points,
                    so_far
                    FROM entries AS all_entries
                INNER JOIN solutions ON solutions.entry = all_entries.entry
                WHERE displayed = 1
                AND all_entries.translator = (
                    SELECT translator FROM translators
                    ORDER BY last_used DESC
                    LIMIT 1
                )
                {search_queries}
                ORDER BY LOWER(all_entries.question)
                LIMIT {max_rows + 1} OFFSET ?
            ) AS entries
        LEFT JOIN mentions ON mentions.entry = entries.entry
        GROUP BY entries.entry
        ORDER BY LOWER(entries.question)
        """, (*(map(escape, searches) if searches else ()), offset)
    ))


@app.route('/create')
def create():
    conn = get_connection()

    if not any(conn.execute("SELECT 1 FROM translators")):
        return redirect(url_for("languages"))

    sheets = get_sheets()
    entries = get_entries()

    return render_template(
        "create.html",
        sheets=sheets[:max_rows],
        entries=entries[:max_rows],
        topbar=get_recent_translations(),
        load_more_sheets=len(sheets) > max_rows,
        load_more_entries=len(entries) > max_rows
    )


@app.route('/create/load_more_sheets')
def load_more_sheets() -> Tuple[Dict[str, str], int]:
    offset = int(request.args['already'])
    searches = request.args["query"].split(' ')
    sheets = get_sheets(searches=searches, offset=offset)

    return {
        'more_sheets': len(sheets) > max_rows,
        'sheets': sheets[:max_rows]
    }, 200


@app.route('/create/load_more_entries')
def load_more_entries() -> Tuple[Dict[str, str], int]:
    offset = int(request.args['already'])
    searches = request.args["query"].split(' ')
    entries = get_entries(searches=searches, offset=offset)
    return {
        'more_entries': len(entries) > max_rows,
        'entries': entries[:max_rows]
    }, 200


@app.route('/create/search')
def search_sheets_and_entries():
    queries = set(request.args["query"].split(' '))

    if request.args["sheets"]:
        sheets = get_sheets(queries)
        more_sheets = len(sheets) > max_rows
    else:
        sheets, more_sheets = [], False

    if request.args["entries"]:
        entries = get_entries(queries)
        more_entries = len(entries) > max_rows
    else:
        entries, more_entries = [], False

    return {
        'sheets': sheets[:max_rows],
        'entries': entries[:max_rows],
        'more_sheets': more_sheets,
        'more_entries': more_entries
    }, 200


@app.route('/create/entry_already_exists')
def entry_already_exists():
    conn = get_connection()
    already_there = bool(conn.execute(
        """
        SELECT 1 FROM entries
        INNER JOIN translators
            ON translators.translator = entries.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND question = ?
        LIMIT 1
        """, (request.args['question'],)
    ).fetchall())

    return {'already_there': already_there}, 200


@app.route('/create/new_sheet')
def new_sheet():
    conn = get_connection()

    # Checks that a sheet for that translator and that name doesn't
    # already exist.
    already_there = bool(conn.execute(
        """
        SELECT 1 FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
        LIMIT 1
        """, (request.args['name'],)
    ).fetchall())

    # If it already exists, exits the function.
    if already_there:
        return {'already_there': True}, 200

    # If it doesn't exist, creates it.
    conn.execute("PRAGMA foreign_keys = OFF;")
    conn.execute(
        """
        INSERT INTO sheets (translator, name)
            SELECT translator, ? FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            ORDER BY translator
            LIMIT 1;
        """, (request.args['name'],)
    )

    # Finds the id for the sheet.
    sheet_s = last_insert_rowid(conn)

    # Finds the entry serial numbers.
    entries = json.loads(request.args['entries'])
    if entries:
        entries_only = " OR ".join("question = ?" for _entry in entries)
        entries_s = conn.execute(
            f"""
            SELECT entry FROM entries
            INNER JOIN translators
                ON translators.translator = entries.translator
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            {f"AND ({entries_only})" if entries_only else ""}
            """, entries
        ).fetchall()

        # Creates a mention for every sheet and entry combination.
        for (entry,) in entries_s:
            conn.execute(
                """
                INSERT INTO mentions (sheet, entry) VALUES
                    (?, ?);
                """, (sheet_s, entry)
            )

    # Saves the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    return {'already_there': False}, 200


@app.route('/create/edit_sheet')
def edit_sheet():
    conn = get_connection()

    # Retrieves certain arguments.
    name = request.args['name']
    prior = request.args['prior']

    # Checks that a sheet for that translator and that name doesn't
    # already exist.
    if name != prior:
        already_there = bool(conn.execute(
            """
            SELECT 1 FROM sheets
            INNER JOIN translators
                ON translators.translator = sheets.translator
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            AND name = ?
            LIMIT 1
            """, (name,)
        ).fetchall())

        # If it already exists, exits the function.
        if already_there:
            return {'already_there': True}, 200

    # Modifies the name.
    conn.execute("PRAGMA foreign_keys = OFF;")

    # Finds the id for the sheet.
    sheet_s = conn.execute(
        """
        SELECT sheet FROM sheets
        WHERE translator = (
            SELECT translator FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            LIMIT 1
        )
            AND name = ?
        """, (prior,)
    ).fetchone()[0]

    # Changes the sheet name if necessary
    if name != prior:
        conn.execute(
            """
            UPDATE sheets SET name = ?
            WHERE sheet = ?
            """, (name, sheet_s)
        )

    # Find all the current entries and corresponding mentions
    mentions = conn.execute(
        """
        SELECT question, mention FROM mentions
        INNER JOIN entries ON entries.entry = mentions.entry
        WHERE sheet = ?
        """, (sheet_s,)
    ).fetchall()
    mentions_e = set(x[0] for x in mentions)
    entry_to_mention = dict(mentions)

    # Find all of the entries expected.
    entries = set(json.loads(request.args['entries']))

    # Find the entries which must be removed and remove them.
    to_remove = mentions_e.difference(entries)
    for mention_e in to_remove:
        conn.execute(
            """
            DELETE FROM mentions
            WHERE mention = ?
            """, (entry_to_mention[mention_e],)
        )

    # Find the entries which must be added and add them.
    to_add = entries.difference(mentions_e)
    for mention_e in to_add:
        conn.execute(
            """
            INSERT INTO mentions (sheet, entry)
            SELECT ?, entry FROM entries
            INNER JOIN translators
                ON translators.translator = entries.translator
            WHERE translators.translator = (
                SELECT translator FROM translators
                WHERE last_used = (
                    SELECT MAX(last_used) FROM translators
                )
            )
            AND question = ?
            LIMIT 1
            """, (sheet_s, mention_e)
        )

    # Saves the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    return {'already_there': False}, 200


@app.route('/create/delete_sheet')
def delete_sheet() -> Tuple[Dict, int]:
    conn = get_connection()
    name = request.args['sheet']

    entries = conn.execute(
        """
        SELECT question FROM sheets
        INNER JOIN mentions ON sheets.sheet = mentions.sheet
        INNER JOIN entries ON entries.entry = mentions.entry
        WHERE sheets.name = ?
            AND sheets.translator = (
                SELECT translators.translator FROM translators
                ORDER BY last_used DESC
                LIMIT 1
            )
        """, (name,)
    ).fetchall()

    conn.execute(
        """
        DELETE FROM sheets
        WHERE name = ?
            AND translator = (
                SELECT translator FROM translators
                ORDER BY last_used DESC
                LIMIT 1
            )
        """, (name,)
    )
    conn.commit()

    return {"entries": entries}, 200


@app.route('/create/delete_entry')
def delete_entry():
    conn = get_connection()
    question = request.args['entry']

    sheets = conn.execute(
        """
        SELECT name FROM entries
        INNER JOIN mentions ON entries.entry = mentions.entry
        INNER JOIN sheets ON sheets.sheet = mentions.sheet
        WHERE entries.question = ?
            AND sheets.translator = (
                SELECT translators.translator FROM translators
                ORDER BY last_used DESC
                LIMIT 1
            )
        """, (question,)
    ).fetchall()

    conn.execute(
        """
        DELETE FROM entries
        WHERE question = ?
            AND translator = (
                SELECT translator FROM translators
                ORDER BY last_used DESC
                LIMIT 1
            )
        """, (question,)
    )
    conn.commit()

    return {"sheets": sheets}, 200


@app.route('/create/new_entry')
def new_entry():
    conn = get_connection()

    # Checks that an entry for that translator and that name doesn't
    # already exist.
    already_there = bool(conn.execute(
        """
        SELECT 1 FROM entries
        INNER JOIN translators
            ON translators.translator = entries.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND question = ?
        LIMIT 1
        """, (request.args['question'],)
    ).fetchall())

    # If it already exists, exits the function.
    if already_there:
        return {'already_there': True}, 200

    # If it doesn't exist, create it.
    conn.execute("PRAGMA foreign_keys = OFF;")
    conn.execute(
        """
        INSERT INTO entries (translator, question)
            SELECT translator, ? FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            ORDER BY translator
            LIMIT 1
        """, (request.args['question'],)
    )

    # Finds the id for the entry.
    entry_s = last_insert_rowid(conn)

    # Inserts each of the different answers.
    more_answers = json.loads(request.args['moreAnswers'])
    solutions = tuple(chain(*zip(
        repeat(entry_s),
        chain((request.args['answer'],), more_answers),
        chain((True,), repeat(False))
    )))
    conn.execute(
        "INSERT INTO solutions (entry, text, displayed) VALUES"
        + ",".join("(?, ?, ?)" for _i in range(1 + len(more_answers))),
        solutions
    )

    # Finds the sheet serial numbers.
    sheets = json.loads(request.args['sheets'])
    if sheets:
        sheets_only = " OR ".join("name = ?" for _sheet in sheets)
        sheets_s = conn.execute(
            f"""
            SELECT sheet FROM sheets
            INNER JOIN translators
                ON translators.translator = sheets.translator
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            {f"AND ({sheets_only})" if sheets_only else ""}
            """, sheets
        ).fetchall()

        # Creates a mention for every sheet and entry combination.
        for (sheet,) in sheets_s:
            conn.execute(
                """
                INSERT INTO mentions (sheet, entry) VALUES
                    (?, ?);
                """, (sheet, entry_s)
            )

    # Saves the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    return {"already_there": False}, 200


@app.route('/create/extant_entries')
def extant_entries():
    conn = get_connection()

    sheet_name = request.args["sheet"]
    entries = [x[0] for x in conn.execute(
        """
        SELECT question FROM entries
        INNER JOIN translators
            ON translators.translator = entries.translator
        INNER JOIN mentions ON mentions.entry = entries.entry
        INNER JOIN sheets
            ON mentions.sheet = sheets.sheet
        WHERE translators.translator = (
            SELECT translator FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
        )
            AND name = ?
        """, (sheet_name,)
    )]

    return {"entries": entries}, 200


@app.route('/create/load_existing_entry')
def load_existing_entry():
    conn = get_connection()

    question = request.args["question"]
    answers = [x[0] for x in conn.execute(
        """
        SELECT text FROM entries
        INNER JOIN solutions ON solutions.entry = entries.entry
        INNER JOIN translators
            ON entries.translator = translators.translator
        WHERE question = ?
        AND translators.translator = (
            SELECT translator FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
        )
        ORDER BY displayed DESC
        """, (question,)
    )]

    sheets = [x[0] for x in conn.execute(
        """
        SELECT name FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries
            ON mentions.entry = entries.entry
        WHERE translators.translator = (
            SELECT translator FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
        )
            AND question = ?
        """, (question,)
    )]

    return {"answers": answers, "sheets": sheets}, 200


@app.route('/create/edit_entry')
def edit_entry():
    conn = get_connection()

    question = request.args["question"]
    prior = request.args["prior"]
    main_answer = request.args["answer"]
    more_answers = json.loads(request.args["moreAnswers"])

    # Checks that a sheet for that translator and that name doesn't
    # already exist.
    if question != prior:
        already_there = bool(conn.execute(
            """
            SELECT 1 FROM entries
            INNER JOIN translators
                ON translators.translator = entries.translator
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
                AND question = ?
            LIMIT 1
            """, (question,)
        ).fetchall())

        # If it already exists, exits the function.
        if already_there:
            return {'already_there': True}, 200

    # Modifies the name.
    conn.execute("PRAGMA foreign_keys = OFF;")

    # Finds the id for the entry.
    entry_s = conn.execute(
        """
        SELECT entry FROM entries
        WHERE translator = (
            SELECT translator FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            LIMIT 1
        )
            AND question = ?
        """, (prior,)
    ).fetchone()[0]

    # Changes the entry question if necessary
    if question != prior:
        conn.execute(
            """
            UPDATE entries SET question = ?
            WHERE entry = ?
            """, (question, entry_s)
        )

    # Find all the current sheets and corresponding mentions
    mentions = conn.execute(
        """
        SELECT name, mention FROM mentions
        INNER JOIN sheets ON sheets.sheet = mentions.sheet
        WHERE entry = ?
        """, (entry_s,)
    ).fetchall()
    mentions_s = set(x[0] for x in mentions)
    sheet_to_mention = dict(mentions)

    # Find all of the sheets expected.
    sheets = set(json.loads(request.args['sheets']))

    # Find the sheets which must be removed and remove them.
    to_remove = mentions_s.difference(sheets)
    for mention_s in to_remove:
        conn.execute(
            """
            DELETE FROM mentions
            WHERE mention = ?
            """, (sheet_to_mention[mention_s],)
        )

    # Find the sheets which must be added and add them.
    to_add = sheets.difference(mentions_s)
    for mention_s in to_add:
        conn.execute(
            """
            INSERT INTO mentions (sheet, entry)
            SELECT sheet, ? FROM sheets
            INNER JOIN translators
                ON translators.translator = sheets.translator
            WHERE translators.translator = (
                SELECT translator FROM translators
                WHERE last_used = (
                    SELECT MAX(last_used) FROM translators
                )
            )
            AND name = ?
            LIMIT 1
            """, (entry_s, mention_s)
        )

    # Deletes all solutions for the question.
    conn.execute("DELETE FROM solutions WHERE entry = ?", (entry_s,))

    # Adds entries for the question.
    conn.execute(
        f"""
        INSERT INTO solutions (entry, text, displayed) VALUES
            {", ".join(("(?, ?, ?)",) * (len(more_answers) + 1))}
        """, sum(((entry_s, main_answer, True), *(
            (entry_s, answer, False) for answer in more_answers
        )), ())
    )

    # Creates new sheets

    # Saves the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    return {"already_there": False}, 200
