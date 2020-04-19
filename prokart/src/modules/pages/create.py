# Builtins
from itertools import chain, repeat
import json
from typing import Dict, List, Optional, Set, Tuple, Union

# Installed packages
from flask import render_template, redirect, request, url_for

# Local imports
from prokart.src.application import app
from prokart.src.modules.sql_handler import (
    escape, get_connection, get_recent_translations, last_insert_rowid
)
from prokart.src.modules.sheets import get_sheets


def get_entries(
        searches: Optional[Set[str]] = None, offset: int = 0
) -> List[Tuple[str, str, int, int]]:
    """Finds the top entries.
    :param Optional[Set[str]] searches: The different string
        combinations that must occur in the sheet names.
    :param int offset: How many entries given the query have been
        returned already.
    :return: Each of the different entries with the following values:
        * Question
        * Answer
        * Number of appearances in different sheets
        * Number of stars
    :rtype: List[Tuple[str, str, int, int]]
    """
    # Establishes a connection.
    conn = get_connection()

    # Constructs the part of the query that filters the searches.
    search_queries = "\n".join(
        "AND all_entries.question LIKE '%' || ? || '%' ESCAPE ' '"
        for _search in searches
    ) if searches else ""

    # Returns the results.
    return conn.execute(
        f"""
        SELECT
            question,
            answer,
            COUNT(mentions.entry),
            points + (so_far == needed)
            FROM (
                SELECT
                    all_entries.entry,
                    solutions.text AS answer,
                    question,
                    points,
                    needed,
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
                LIMIT {app.config["MAX_ROWS"] + 1} OFFSET ?
            ) AS entries
        LEFT JOIN mentions ON mentions.entry = entries.entry
        GROUP BY entries.entry
        ORDER BY LOWER(entries.question)
        """, (*(map(escape, searches) if searches else ()), offset)
    ).fetchall()


@app.route('/create')
def create() -> Tuple[str, int]:
    """Returns the page for the creation area.
    :return: The creation area page.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Prevents use of the page if there are no translators created yet,
    # redirecting instead to the languages page.
    if not any(conn.execute("SELECT 1 FROM translators")):
        return redirect(url_for("languages"))

    # Gets the sheets and entries for the page.
    sheets = get_sheets()
    entries = get_entries()

    # Renders and returns the page.
    return render_template(
        "create.html",
        sheets=sheets[:app.config["MAX_ROWS"]],
        entries=entries[:app.config["MAX_ROWS"]],
        topbar=get_recent_translations(),
        load_more_sheets=len(sheets) > app.config["MAX_ROWS"],
        load_more_entries=len(entries) > app.config["MAX_ROWS"]
    ), 200


@app.route('/create/load_more_sheets')
def load_more_sheets() -> Tuple[Dict[str, Union[
    bool, List[Tuple[str, int, int]]
]], int]:
    """Loads more sheets to append to an existing table.
    :return: The different sheets to be appended. Also returns whether
        or not there are more sheets remaining.
    :rtype: Tuple[Dict[str, Union[
        bool, List[Tuple[str, int, int]]
    ]]], int]
    """
    # Finds the number of sheets already present.
    offset = int(request.args['already'])

    # Finds the different search queries to use.
    searches = request.args["query"].split(' ')

    # Finds the sheets to be returned.
    sheets = get_sheets(searches=searches, offset=offset)

    # Returns the sheets and whether or not more sheets remain.
    return {
        'sheets': sheets[:app.config["MAX_ROWS"]],
        'more_sheets': len(sheets) > app.config["MAX_ROWS"]
    }, 200


@app.route('/create/load_more_entries')
def load_more_entries() -> Tuple[Dict[str, Union[
    bool, List[Tuple[str, str, int, int]]
]], int]:
    """Loads more entries to append to an existing table.
    :return: The different entries to be appended. Also returns whether
        or not there are more entries remaining.
    :rtype: Tuple[Dict[str, Union[
        bool, List[Tuple[str, str, int, int]]
    ]]], int]
    """
    # Finds the number of entries already present.
    offset = int(request.args['already'])

    # Finds the different search queries to use.
    searches = set(request.args["query"].split(' '))

    # Finds the entries to be returned.
    entries = get_entries(searches=searches, offset=offset)

    # Returns the entries and whether or not more entries remain.
    return {
        'more_entries': len(entries) > app.config["MAX_ROWS"],
        'entries': entries[:app.config["MAX_ROWS"]]
    }, 200


@app.route('/create/search')
def search_sheets_and_entries() -> Tuple[Dict[str, Union[
    bool, List[Tuple[str, int, int]], List[Tuple[str, str, int, int]]
]], int]:
    """Searches sheets and/or entries based on the same search queries.
    :return: The sheets and entries from the search, as well as whether
        or not there are more sheets and entries.
    :rtype: Tuple[Dict[str, Union[
        bool, List[Tuple[str, int, int]],
        List[Tuple[str, str, int, int]]
    ]], int]
    """
    # Finds the different search queries to use.
    queries = set(request.args["query"].split(' '))

    # If sheets have been requested, finds the sheets and whether or not
    # there are more.
    if request.args["sheets"]:
        sheets = get_sheets(queries)
        more_sheets = len(sheets) > app.config["MAX_ROWS"]
    else:
        sheets, more_sheets = [], False

    # If entries have been requested, finds the sheets and whether or
    # not there are more.
    if request.args["entries"]:
        entries = get_entries(queries)
        more_entries = len(entries) > app.config["MAX_ROWS"]
    else:
        entries, more_entries = [], False

    # Returns the results.
    return {
        'sheets': sheets[:app.config["MAX_ROWS"]],
        'entries': entries[:app.config["MAX_ROWS"]],
        'more_sheets': more_sheets,
        'more_entries': more_entries
    }, 200


@app.route('/create/entry_already_exists')
def entry_already_exists() -> Tuple[Dict[str, bool], int]:
    """Determines whether or not an entry with the given question
        already exists.
    :return: Whether or not it exists.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds whether or not the entry exists, based on the question.
    already_there = bool(conn.execute(
        """
        SELECT 1 FROM entries
        INNER JOIN translators
            ON translators.translator = entries.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND question = ?
        """, (request.args['question'],)
    ).fetchone())

    # Returns the result.
    return {'already_there': already_there}, 200


@app.route('/create/new_sheet')
def new_sheet() -> Tuple[Dict[str, bool], int]:
    """Attempts to create a new sheet with the provided name and linked
    to the provided entries.
    :return: Whether or not the sheet existed.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Establishes a connection.
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
        """, (request.args['name'],)
    ).fetchone())

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

    # If there are entries to be added.
    if entries:
        # Prepares the query regarding possible question values.
        entries_only = " OR ".join("question = ?" for _entry in entries)

        # Finds the ID values for each entry to be added.
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

    # Returns successful result.
    return {'already_there': False}, 200


@app.route('/create/edit_sheet')
def edit_sheet() -> Tuple[Dict[str, bool], int]:
    """Attempts to edit a sheet by its name and/or its entries.
    :return: Whether or not there was an illegitimate attempt to move
        the sheet to a name already taken.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Establishes a connection.
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
    conn.execute("PRAGMA foreign_keys = OFF;")
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

    # Returns successful result.
    return {'already_there': False}, 200


@app.route('/create/delete_sheet')
def delete_sheet() -> Tuple[Dict[str, List[int]], int]:
    """Deletes a sheet and returns the entry questions that were
    formerly contained in that sheet.
    :return: The questions of the entries affected.
    :rtype: Tuple[Dict[str, List[int]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the name of the sheet to be deleted.
    name = request.args['sheet']

    # Finds the entries connected to the sheet.
    entries = [x[0] for x in conn.execute(
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
    ).fetchall()]

    # Deletes the sheet itself.
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

    # Commits the changes.
    conn.commit()

    # Returns the result.
    return {"entries": entries}, 200


@app.route('/create/delete_entry')
def delete_entry() -> Tuple[Dict[str, List[str]], int]:
    """Deletes an entry and returns the sheet names that formerly
    contained that entry.
    :return: The names of the sheets affected.
    :rtype: Tuple[Dict[str, List[int]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the question for the entry to be deleted.
    question = request.args['entry']

    # Finds the sheets which contain the entry.
    sheets = [x[0] for x in conn.execute(
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
    ).fetchall()]

    # Deletes the entry.
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

    # Commits the changes.
    conn.commit()

    # Returns the results.
    return {"sheets": sheets}, 200


@app.route('/create/new_entry')
def new_entry() -> Tuple[Dict[str, bool], int]:
    """Attempts to create a new entry with the provided question and
    answer as well as linked to the provided sheets.
    :return: Whether or not the entry existed.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Establishes a connection.
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

    # Commits the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    # Returns the result.
    return {"already_there": False}, 200


@app.route('/create/extant_entries')
def extant_entries() -> Tuple[Dict[str, List[str]], int]:
    """Finds all the entries's questions which belong to a sheet.
    :return: The list of questions.
    :rtype: Tuple[Dict[str, List[str]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the name of the sheet being searched.
    sheet_name = request.args["sheet"]

    # Finds all entries belonging to that sheet.
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

    # Returns the result.
    return {"entries": entries}, 200


@app.route('/create/load_existing_entry')
def load_existing_entry():
    """Finds the existing answers and sheet names associated with a
    particular entry.
    :return: The list of answers and list of sheet names.
    :rtype: Tuple[Dict[str, List[str]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the question for the entry being searched.
    question = request.args["question"]

    # Finds the list of possible answers for the entry.
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

    # Finds the list of names of sheets containing the entry.
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

    # Returns the results.
    return {"answers": answers, "sheets": sheets}, 200


@app.route('/create/edit_entry')
def edit_entry() -> Tuple[Dict[str, bool], int]:
    """Attempts to edit an entry by its question, answers and/or its
    sheets.
    :return: Whether or not there was an illegitimate attempt to move
        the entry to a question already taken.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the question, the question prior to editing, the primary
    # answer, and the additional answers.
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

    # Commits the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    # Returns the result.
    return {"already_there": False}, 200
