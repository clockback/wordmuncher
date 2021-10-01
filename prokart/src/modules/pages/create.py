# Builtins
from itertools import chain
import json
from typing import Callable, Dict, List, Optional, Set, Tuple, Union

# Installed packages
from flask import render_template, redirect, request, url_for

# Local imports
from prokart.src.application import app
from prokart.src.modules.sql_handler import (
    escape, get_connection, get_recent_translations, get_schemas,
    last_insert_rowid, save_new_schema, save_edit_schema
)
from prokart.src.modules.sheets import get_sheets


def decorate_find_queries(queries: Set[str]) -> Callable[[str], bool]:
    """Checks whether or not a vocabulary entry answer contains all
    provided search terms.
    """
    simplified_queries = set()

    # Removes any accent characters from consideration.
    for original_query in queries:
        simplified_queries.add(original_query.replace(chr(769), ""))

    def find_queries(question_str: str, entries_str: str) -> bool:
        """Checks whether or not a vocabulary entry answer contains all
        specifically provided search terms.
        """
        entries = json.loads(entries_str)

        if isinstance(entries, list):
            check_str = " ".join(entries)
        elif isinstance(next(iter(entries.values())), str):
            check_str = " ".join(entries.values())
        else:
            check_str = " ".join(
                " ".join(cluster.values()) for cluster in entries.values()
            )

        check_str += f" {question_str}"

        for query in simplified_queries:
            if query not in check_str.replace(chr(769), ""):
                return False

        return True

    return find_queries


def get_entries(
        searches: Optional[Set[str]] = None, offset: int = 0,
        filter_schema_answers: bool = False
) -> List[Tuple[str, str, int, int]]:
    """Finds the top entries.
    :param Optional[Set[str]] searches: The different string
        combinations that must occur in the sheet names.
    :param int offset: How many entries given the query have been
        returned already.
    :param bool filter_schema_answers: Whether or not to filter the
        schema answers.
    :return: Each of the different entries with the following values:
        * Question
        * Answer
        * Number of appearances in different sheets
        * Number of stars
    :rtype: List[Tuple[str, str, int, int]]
    """
    # Establishes a connection.
    conn = get_connection()

    conn.create_function("find_queries", 2, decorate_find_queries(
        searches if searches else set()
    ))

    results = conn.execute(
        f"""
        SELECT
            question,
            json_extract(solutions, '$[0]'),
            COUNT(mentions.entry),
            points + (so_far == needed)
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
                AND all_entries.translator = (
                    SELECT translator FROM translators
                    ORDER BY last_used DESC
                    LIMIT 1
                )
                ORDER BY LOWER(all_entries.question)
                LIMIT {app.config["MAX_ROWS"] + 1} OFFSET ?
            ) AS entries
        LEFT JOIN mentions ON mentions.entry = entries.entry
        GROUP BY entries.entry
        ORDER BY LOWER(entries.question)
        """, (offset,)
    ).fetchall()

    # Filters the answers to have no None values if necessary.
    if filter_schema_answers:
        for i, result in enumerate(results):
            if result[1] is None:
                results[i] = result[0], "", *result[2:]

    # Returns the results.
    return results


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
    entries = get_entries(filter_schema_answers=True)

    # Renders and returns the page.
    return render_template(
        "create.html",
        sheets=sheets[:app.config["MAX_ROWS"]],
        entries=entries[:app.config["MAX_ROWS"]],
        topbar=get_recent_translations(conn),
        load_more_sheets=len(sheets) > app.config["MAX_ROWS"],
        load_more_entries=len(entries) > app.config["MAX_ROWS"],
        schemas=get_schemas(conn)
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
    # Finds the name of the sheet to be found.
    question = request.args['question']

    # Finds the question of an entry to be ignored even if it exists.
    prior = request.args.get('prior', None)

    # If the name is the same as the one ignored, returns False.
    if question == prior:
        return {'already_there': False}, 200

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
        """, (question,)
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


@app.route('/create/order_to_serial')
def order_to_serial_json() -> Tuple[
    Dict[str, Union[Dict[int, Dict[int, str]], Dict[int, str]]], int
]:
    """Converts a collection of answers to use id values instead of
    orderings, sending the new dictionary back in return.
    :return: The answers where subschema and quality id values are used
        instead of orderings.
    :rtype: Tuple[
        Dict[str, Union[Dict[int, Dict[int, str]], Dict[int, str]]], int
    ]
    """
    return {"answers": order_to_serial(request['answers'])[1]}, 200


def order_to_serial(
        answers: Dict[str, Union[str, Dict[str, Dict[str, str]]]]
) -> Tuple[int, Union[Dict[int, Dict[int, str]], Dict[int, str]]]:
    """Converts a collection of answers to use id values instead of
    orderings.
    :param Dict[str, Union[str, Dict[str, Dict[str, str]]]] answers: The
        collection of answers.
    :return: The schema serial id and the answers where subschema and
        quality id values are used instead of orderings.
    :rtype: Tuple[int, Union[Dict[int, Dict[int, str]], Dict[int, str]]]
    """
    schema_s, schema = find_schema(answers['name'])
    ma_dict = {}

    # Corrects all the columns.
    for column in filter(lambda col: col != "name", answers):
        # Finds the serial for the column quality.
        column_s = next(iter(filter(
            lambda x: x[1] == 0 and str(x[3]) == column,
            schema["qualities"]
        )))[0]

        # If there is a row subschema, corrects all the rows.
        if isinstance(answers[column], dict):
            # Starts creating a dictionary for the rows.
            column_dict = {}

            # Corrects the row.
            for row in answers[column]:
                row_s = next(iter(filter(
                    lambda x: x[1] == 1 and str(x[3]) == row,
                    schema["qualities"]
                )))[0]
                column_dict[row_s] = answers[column][row]

            # Assigns the rows for that column.
            ma_dict[column_s] = column_dict

        # Otherwise uses the string answer for the column.
        else:
            ma_dict[column_s] = answers[column]

    return schema_s, ma_dict


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

    # Finds the provided answers.
    answers = json.loads(request.args['answers'])

    # Does not modify the JSON if it is a list of possible answers.
    if isinstance(answers, list):
        modified_answers = request.args['answers']
        schema_s = None

    # If the JSON is a dictionary, changes order to primary keys.
    elif isinstance(answers, dict):
        schema_s, ma_dict = order_to_serial(answers)
        modified_answers = json.dumps(ma_dict)
    else:
        raise TypeError(f"answers has incorrect structure: {answers}")

    # If it doesn't exist, create it.
    conn.execute("PRAGMA foreign_keys = OFF;")
    conn.execute(
        """
        INSERT INTO entries (translator, schema, question, solutions)
            SELECT translator, ?, ?, ? FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
            ORDER BY translator
            LIMIT 1
        """, (schema_s, request.args['question'], modified_answers)
    )

    # Finds the id for the entry.
    entry_s = last_insert_rowid(conn)

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
    """Finds all the entries' questions which belong to a sheet.
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
def load_existing_entry() -> Tuple[Dict[
        str, List[Union[str, Optional[List[Tuple[int, int, int]]], List[str]]]
], int]:
    """Finds the existing answers and sheet names associated with a
    particular entry.
    :return: The list of answers and list of sheet names.
    :rtype: Tuple[Dict[
        str, Optional[List[Union[str, List[Tuple[int, int, int]]],
        List[str]]]
    ], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the question for the entry being searched.
    question = request.args["question"]

    # Finds the id value of the entry.
    entry_s, schema_s, answers = conn.execute(
        """
        SELECT entry, schema, solutions
            FROM entries
        INNER JOIN translators
            ON entries.translator = translators.translator
        WHERE question = ?
        AND translators.translator = (
            SELECT translator FROM translators
            WHERE last_used = (
                SELECT MAX(last_used) FROM translators
            )
        )
        LIMIT 1
        """, (question,)
    ).fetchone()

    schema_name = conn.execute(
        """
        SELECT name FROM schemas
        WHERE schema = ?;
        """, (schema_s,)
    ).fetchone()[0] if schema_s else ""

    # Finds the list of names of sheets containing the entry.
    sheets = [x[0] for x in conn.execute(
        """
        SELECT name FROM sheets
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries
            ON mentions.entry = entries.entry
        WHERE entries.entry = ?
        """, (entry_s,)
    )]

    answers_j = json.loads(answers)
    if isinstance(answers, dict):
        answers_j["name"] = schema_name

    # Returns the results.
    return {
        "schema_name": schema_name, "answers": answers_j, "sheets": sheets
    }, 200


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

    # Finds the correct JSON structure for the answers as used in the
    # database. Also finds the schema, provided there is one.
    raw_answers = json.loads(request.args["answers"])
    if isinstance(raw_answers, dict):
        schema_s, updated_answers = order_to_serial(
            json.loads(request.args["answers"])
        )
        answers = json.dumps(updated_answers)
    else:
        answers = json.dumps(raw_answers)
        schema_s = None

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

    # Changes the entry question and answers.
    conn.execute(
        """
        UPDATE entries SET question = ?, schema = ?, solutions = ?
        WHERE entry = ?
        """, (question, schema_s, answers, entry_s)
    )

    # Find all the current sheets and corresponding mentions.
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

    # Commits the changes.
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    # Returns the result.
    return {"already_there": False}, 200


@app.route('/create/schema_already_exists')
def schema_already_exists() -> Tuple[Dict[str, bool], int]:
    """Determines whether or not a schema with the given name already
    exists.
    :return: Whether or not it exists.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Finds the name of the sheet to be found.
    name = request.args['name']

    # Finds the question of an entry to be ignored even if it exists.
    prior = request.args.get('prior', None)

    # If the name is the same as the one ignored, returns False.
    if name == prior:
        return {'already_there': False}, 200

    # Establishes a connection.
    conn = get_connection()

    # Finds whether or not the entry exists, based on the question.
    already_there = bool(conn.execute(
        """
        SELECT 1 FROM schemas
        WHERE name = ?
        """, (name,)
    ).fetchone())

    # Returns the result.
    return {'already_there': already_there}, 200


@app.route('/create/save_schema')
def save_schema() -> Tuple[Dict[str, int], int]:
    """Saves the schema.
    :return: The id for the schema.
    :rtype: Tuple[Dict[str, int], int]
    """
    # Finds the name and structure of the schema.
    name = request.args['name']
    structure = json.loads(request.args['structure'])
    orig_name = request.args['origName']
    answers = json.loads(request.args['answers'])

    # Establishes a connection.
    conn = get_connection()

    # Determines whether or not the schema is new or an edit.
    is_new = orig_name == ""

    # Adds the columns subschema.
    if is_new:
        schema_s, answers = save_new_schema(conn, name, structure), {}
    else:
        schema_s, answers = save_edit_schema(
            conn, name, structure, orig_name, answers
        )

    # Returns the schema and updated answers answers.
    return {"schema": schema_s, "answers": answers}, 200


@app.route('/create/choose_schema')
def choose_schema() -> Tuple[Dict[str, Union[
    List[Tuple[int, str, int]], List[Tuple[int, int, str, int]],
    Union[Dict[int, Dict[int, str]], Dict[int, str]]
]], int]:
    """Returns the structure of the schema with the give name.
    :return: The schema structure.
    :rtype: Tuple[Dict[str, Union[
        List[Tuple[int, str, int]], List[Tuple[int, int, str, int]],
        Union[Dict[int, Dict[int, str]], Dict[int, str]]
    ]], int]
    """
    schema = dict(find_schema(request.args['schema'])[1])
    answers = json.loads(request.args.get("answers", "{}"))

    if isinstance(answers, dict) and "name" not in answers:
        answers["name"] = request.args["schema"]

    if request.args.get("answers") not in (None, "null"):
        schema["answers"] = answers
    else:
        schema["answers"] = {}

    return schema, 200


def find_schema(name: str) -> Tuple[int, Dict[str, Union[
    List[Tuple[int, str, int]], List[Tuple[int, int, str, int]]
]]]:
    """Returns the structure of the schema with the give name.
    :return: The schema id and structure.
    :rtype: Tuple[int, Dict[str, Union[
        List[Tuple[int, str, int]], List[Tuple[int, int, str, int]]
    ]]]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the schema id.
    schema, = conn.execute(
        """
        SELECT schema FROM schemas
        WHERE name = ?
        """, (name,)
    ).fetchone()

    # Finds the subschemas.
    subschemas = list(chain(conn.execute(
        """
        SELECT subschemas.subschema, subschemas.name, COUNT(*)
        FROM subschemas
        INNER JOIN qualities
            ON subschemas.subschema = qualities.subschema
        WHERE schema = ?
        GROUP BY subschemas.subschema
        ORDER BY subschemas.pos
        """, (schema,)
    ).fetchall()))

    # Finds the qualities.
    qualities = conn.execute(
        """
        SELECT
            qualities.quality,
            subschemas.pos,
            qualities.name,
            qualities.pos
        FROM qualities
        INNER JOIN subschemas
            ON subschemas.subschema = qualities.subschema
        WHERE schema = ?
        ORDER BY subschemas.pos, qualities.pos
        """, (schema,)
    ).fetchall()

    return schema, {
        "subschemas": subschemas,
        "qualities": qualities
    }


@app.route('/create/count_schema_entries')
def count_schema_entries() -> Tuple[Dict[str, int], int]:
    """Finds the number of entries that rely on a schema.
    :return: The number of entries.
    :rtype: Tuple[str, int]
    """
    conn = get_connection()

    uses = conn.execute(
        """
        SELECT COUNT(*) FROM schemas
        INNER JOIN entries
            ON entries.schema = schemas.schema
        WHERE name = ?;
        """, (request.args["name"],)
    ).fetchone()[0]

    return {"uses": uses}, 200


@app.route('/create/delete_schema')
def delete_schema() -> Tuple[str, int]:
    """Deletes the schema.
    :return: None
    """
    # Establishes a connection.
    conn = get_connection()

    # Deletes the schema.
    conn.execute(
        "DELETE FROM schemas WHERE name = ?;", (request.args["schema"],)
    )

    # Saves the changes.
    conn.commit()

    # Returns nothing.
    return "", 204
