# Builtins
from difflib import SequenceMatcher
import json
from typing import Dict, List, Optional, Tuple, Union

# Installed packages
from flask import abort, render_template, request

# Local imports
from prokart.src.application import app
from prokart.src.modules.sql_handler import get_connection


@app.route('/test/<path:sheet_name>')
def test_sheet(sheet_name: str) -> Optional[Tuple[str, int]]:
    """Returns the page for the test area.
    :param str sheet_name: The name of the sheet being tested.
    :return: The test area page.
    :rtype: Optional[Tuple[str, int]]
    """
    # Establishes a connection.
    conn = get_connection()

    # Checks whether or not the sheet exists.
    found = bool(conn.execute(
        """
        SELECT 1 FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
        LIMIT 1
        """, (sheet_name,)
    ).fetchall())

    # If there is a sheet with the given name, renders and returns the
    # page.
    if found:
        return render_template("test_sheet.html", sheet_name=sheet_name), 200

    # Otherwise, raises a 404 error.
    else:
        abort(404)


@app.route('/test_sheet/get_question')
def get_question() -> Tuple[Dict[str, Union[str, int]], int]:
    """Finds a new question for the sheet.
    :return: The new question and its present score.
    :rtype: Tuple[Dict[str, Union[str, int]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the previous three entries.
    previous = list(filter(bool, json.loads(
        request.args.get("previous", "[]")
    )))

    # Selects, perhaps randomly, the question to be asked, along with
    # its scoring.
    (
        question, schema, answer_json, points, needed, so_far
    ) = conn.execute(
        f"""
        SELECT question, schema, solutions, points, needed, so_far
        FROM sheets
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
        INNER JOIN translators
            ON translators.translator = sheets.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND sheets.name = ?
        ORDER BY
        {
            "CASE " + " ".join(
                f"WHEN question = ? THEN {i}" for i, _ in
                enumerate(previous, 1)
            ) + " ELSE 0 END, "
            if previous else ""
        }
        CASE
            WHEN (needed > 2 OR so_far = 1) THEN 0
            WHEN (so_far = 0) THEN 1
            ELSE 2 END,
        RANDOM()
        LIMIT 1;
        """,
        (request.args['sheet'], *previous)
    ).fetchone()

    json_answers = {}

    if schema is not None:
        answer = json.loads(answer_json)

        subschemas = conn.execute(
            """
            SELECT subschema, name FROM subschemas
            WHERE schema = ?
            ORDER BY pos;
            """, (schema,)
        ).fetchall()

        second_subschema_clause = (
            "" if len(subschemas) == 1 else "OR subschema = ?"
        )

        qualities = conn.execute(
            f"""
            SELECT quality, subschema, name FROM qualities
            WHERE subschema = ?
            {second_subschema_clause}
            ORDER BY pos;
            """, tuple(x[0] for x in subschemas)
        ).fetchall()

        column_id, json_answers["columns"] = subschemas[0]
        column_qualities = [
            quality[::2] for quality in qualities if quality[1] == column_id
        ]
        json_answers["column ids"] = [x[0] for x in column_qualities]
        json_answers["column names"] = [x[1] for x in column_qualities]

        if len(subschemas) == 2:
            row_id, json_answers["rows"] = subschemas[1]
            row_qualities = [
                quality[::2] for quality in qualities if quality[1] == row_id
            ]
            json_answers["row ids"] = [x[0] for x in row_qualities]
            json_answers["row names"] = [x[1] for x in row_qualities]

        else:
            json_answers["rows"], row_qualities = None, None

        json_answers["answer_locations"] = []

        for column_quality in answer:
            for i, (column_id, _column_name) in enumerate(column_qualities):
                if column_id == int(column_quality):
                    break
            else:
                raise ValueError(f"Answer has extra quality: {column_quality}")

            if len(subschemas) == 1:
                json_answers["answer_locations"].append(i)
                continue

            for row_quality in answer[column_quality]:
                for j, (row_id, _row_name) in enumerate(row_qualities):
                    if row_id == int(row_quality):
                        break
                else:
                    raise ValueError(
                        f"Answer has extra quality: {row_quality}"
                    )

                json_answers["answer_locations"].append([i, j])

    # Returns the result.
    return {
        "question": question,
        "answers": json_answers if json_answers else None,
        "points": points,
        "needed": needed,
        "so_far": so_far
    }, 200


@app.route('/test_sheet/check_answer')
def check_answer() -> Tuple[Dict[str, Union[bool, None, List[str]]], int]:
    """Checks whether or not an attempted answer is correct, close to
    being correct, or incorrect.
    :return: Multiple values:
        * Whether or not the answer is correct.
        * Whether or not the answer was close to being correct.
        * The answer to which the attempt was the closest.
        * The other answers.
    :rtype: Tuple[Dict[str, Union[bool, None, List[str]]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the sheet, question, attempted answer, and whether or not
    # the question has already been tried. Note that if it has already
    # been tried, being close is only as good as being incorrect.
    sheet = request.args["sheet"]
    question = request.args["question"]
    answer = request.args["answer"]
    already = int(request.args["already_attempted"])

    entry, needed, solutions = conn.execute(
        """
        SELECT entries.entry, needed, solutions FROM sheets
        INNER JOIN translators
            ON sheets.translator = translators.translator
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON entries.entry = mentions.entry
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND sheets.name = ?
        AND question = ?;
        """, (sheet, question)
    ).fetchone()

    # Finds the solutions.
    possible_solutions = json.loads(solutions)

    # Maintains record of which answers need correction.
    corrections = []

    # Checks if the question uses a schema.
    if conn.execute(
        """
        SELECT entries.schema FROM entries
        WHERE entries.entry = ?
        """, (entry,)
    ).fetchone()[0] is not None:
        answer = json.loads(answer)
        if answer == possible_solutions:
            return {
                "correct": True,
                "close": True,
                "closest": None,
                "others": [],
                "corrections": corrections
            }, 200

        if isinstance(next(iter(answer.values())), dict):
            answer = {
                (int(i), int(j)): answer[i][j]
                for i in answer for j in answer[i]
            }
            possible_solutions = {
                (int(i), int(j)): possible_solutions[i][j]
                for i in possible_solutions for j in possible_solutions[i]
            }

        # Assumes no answers are too far off.
        intolerable = False

        for key, particular_answer in answer.items():
            particular_solution = possible_solutions[key]
            if particular_answer == particular_solution:
                continue

            # Updates the correction
            if isinstance(key, tuple):
                corrections.append([*key, particular_solution])
            else:
                corrections.append([key, particular_solution])

            # Considers if no intolerable answers have yet been given.
            if not intolerable:
                # Calculates how close the two answers were.
                result = SequenceMatcher(
                    None, particular_answer, particular_solution
                ).ratio()

                if result <= 0.8:
                    intolerable = True

        if not intolerable and not already:
            return {
                "correct": False,
                "close": True,
                "closest": None,
                "others": [],
                "corrections": corrections
            }, 200

        # Resets the score and increases the goal up to 10.
        conn.execute(
            """
            UPDATE entries
                SET needed = ?, so_far = 0, completed = NULL
            WHERE entry = ?;
            """, (min((needed + 1, 10)), entry)
        )

        conn.commit()

        return {
            "correct": False,
            "close": False,
            "closest": None,
            "others": [],
            "corrections": corrections
        }, 200

    else:
        # If the user was correct return the results without further
        # investigation.
        if answer in possible_solutions:
            return {
                "correct": True,
                "close": True,
                "closest": None,
                "others": [],
                "corrections": corrections
            }, 200

        # Prepare to calculate the closest answer to that attempted.
        best, best_ratio = None, 0

        # Iterates over each of the different possible answers.
        for possible_solution in possible_solutions:
            # Calculates how close the two answers were.
            result = SequenceMatcher(
                None, answer, possible_solution
            ).ratio()

            # If it was very close, and the user is on their first try,
            # returns the result without further investigation.
            if result >= 0.9 and not already:
                return {
                    "correct": False,
                    "close": True,
                    "closest": None,
                    "others": [],
                    "corrections": corrections
                }, 200

            # If the answer was both reasonably close and the best so
            # far, records the answer.
            elif result > best_ratio and result > 0.6:
                best, best_ratio = possible_solution, result

        # If no answers were correct, chooses the answer displayed by
        # default.
        if not best:
            best = possible_solutions[-1]

        # Returns the result.
        return {
            "correct": False,
            "close": False,
            "closest": best,
            "others": [x for x in possible_solutions if x != best],
            "corrections": corrections
        }, 200


@app.route('/test_sheet/correct_answer')
def correct_answer() -> Tuple[Dict[str, int], int]:
    """Records the user as having answered an entry correctly.
    :return: The updated scoring.
    :rtype: Tuple[Dict[str, int], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the sheet name and entry question.
    sheet = request.args["sheet"]
    question = request.args["question"]

    # Finds the entry ID, scoring, and most recent completion time of
    # the entry.
    entry, needed, so_far, completed = conn.execute(
        """
        SELECT
            entries.entry AS entry,
            needed,
            so_far,
            completed FROM sheets
        INNER JOIN mentions ON sheets.sheet = mentions.sheet
        INNER JOIN entries ON entries.entry = mentions.entry
        INNER JOIN translators
            ON translators.translator = entries.translator
        WHERE sheets.name = ?
        AND question = ?
        AND last_used = (
            SELECT MAX(last_used) FROM translators
        );
        """, (sheet, question)
    ).fetchone()

    # Checks if the entry has been finished.
    if so_far < needed:
        (completed,) = conn.execute("SELECT datetime('now');").fetchone()

        # If it has been finished, sets both score and goal to 2 points.
        if so_far + 1 == needed:
            so_far = needed = 2

        # Otherwise, merely increases your percentage score.
        else:
            so_far += 1

    # Updates the new scoring for the entry.
    conn.execute(
        """
        UPDATE entries
            SET needed = ?, so_far = ?, completed = ?
        WHERE entry = ?;
        """, (needed, so_far, completed, entry)
    )

    # Checks whether or not the sheet has been completed inasmuch as it
    # is presently possible.
    completed = not conn.execute(
        f"""
        SELECT COUNT(*) FROM entries
        INNER JOIN mentions ON entries.entry = mentions.entry
        INNER JOIN sheets ON sheets.sheet = mentions.sheet
        INNER JOIN translators
            ON translators.translator = entries.translator
        WHERE sheets.name = ?
        AND so_far != needed
        AND last_used = (
            SELECT MAX(last_used) FROM translators
        );
        """, (sheet,)
    ).fetchone()[0]

    # Commits the changes.
    conn.commit()

    # Returns the result.
    return {
        "needed": needed,
        "so_far": so_far,
        "completed": completed
    }, 200


@app.route('/test_sheet/incorrect_answer')
def incorrect_answer() -> Tuple[str, int]:
    """Records the user as having answered an entry incorrectly.
    :return: Bare bones response.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the sheet name and entry question.
    sheet = request.args["sheet"]
    question = request.args["question"]

    # Finds the entry ID and the number of points needed presently.
    entry, needed = conn.execute(
        """
        SELECT entries.entry, needed FROM sheets
        INNER JOIN mentions ON sheets.sheet = mentions.sheet
        INNER JOIN entries ON entries.entry = mentions.entry
        WHERE sheets.name = ?
        AND question = ?;
        """, (sheet, question)
    ).fetchone()

    # Resets the score and increases the goal up to 10.
    conn.execute(
        """
        UPDATE entries
            SET needed = ?, so_far = 0, completed = NULL
        WHERE entry = ?;
        """, (min((needed + 1, 10)), entry)
    )

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return "", 204


@app.route('/test_sheet/remove_answer')
def remove_answer() -> Tuple[str, int]:
    """Removes a single answer from the entry.
    :return: Bare bones response.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the sheet name, entry question, and answer to be removed.
    sheet_name = request.args["sheet"]
    question = request.args["question"]
    answer = request.args["answer"]

    # Finds the old answers to the entry.
    entry_s, solutions_j = conn.execute(
        """
        SELECT entries.entry, solutions FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
        AND question = ?        
        """, (sheet_name, question)
    ).fetchone()

    # Sets a new solution.
    solutions = json.loads(solutions_j)
    solutions.remove(answer)

    # Updates the solution.
    conn.execute(
        """
        UPDATE entries
        SET solutions = ?
        WHERE entries.entry = ?;
        """, (json.dumps(solutions), entry_s)
    ).fetchone()

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return "", 204


@app.route('/test_sheet/add_answer')
def add_answer() -> Tuple[str, int]:
    """Adds an answer to the entry.
    :return: Bare bones response.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the sheet name, entry question, and answer to be added.
    sheet_name = request.args["sheet"]
    question = request.args["question"]
    answer = request.args["answer"]

    # Finds the old answers to the entry.
    entry_s, solutions_j = conn.execute(
        """
        SELECT entries.entry, solutions FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
        AND question = ?        
        """, (sheet_name, question)
    ).fetchone()

    # Sets a new solution.
    solutions = json.loads(solutions_j)
    solutions.append(answer)

    # Updates the solution.
    conn.execute(
        """
        UPDATE entries
        SET solutions = ?
        WHERE entries.entry = ?;
        """, (json.dumps(solutions), entry_s)
    ).fetchone()

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return "", 204
