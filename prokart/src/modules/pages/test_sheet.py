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
    question, points, needed, so_far = conn.execute(
        f"""
        SELECT question, points, needed, so_far FROM sheets
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
        INNER JOIN translators
            ON translators.translator = sheets.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
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

    # Returns the result.
    return {
        "question": question,
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

    # Finds the list of possible solutions.
    possible_solutions = [x[0] for x in conn.execute(
        """
        SELECT solutions.text FROM sheets
        INNER JOIN translators
            ON sheets.translator = translators.translator
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON entries.entry = mentions.entry
        INNER JOIN solutions ON solutions.entry = entries.entry
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND sheets.name = ?
        AND question = ?
        ORDER BY displayed;
        """, (sheet, question)
    ).fetchall()]

    # If the user was correct return the results without further
    # investigation.
    if answer in possible_solutions:
        return {
            "correct": True,
            "close": True,
            "closest": None,
            "others": []
        }, 200

    # Prepare to calculate the closest answer to that attempted.
    best, best_ratio = None, 0

    # Iterates over each of the different possible answers.
    for possible_solution in possible_solutions:
        # Calculates how close the two answers were.
        result = SequenceMatcher(None, answer, possible_solution).ratio()

        # If it was very close, and the user is on their first try,
        # returns the result without further investigation.
        if result >= 0.9 and not already:
            return {
                "correct": False,
                "close": True,
                "closest": None,
                "others": []
            }, 200

        # If the answer was both reasonably close and the best so far,
        # records the answer.
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
        "others": [x for x in possible_solutions if x != best]
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
        WHERE sheets.name = ?
        AND question = ?;
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

    # Commits the changes.
    conn.commit()

    # Returns the result.
    return {
        "needed": needed,
        "so_far": so_far
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

    # Finds the entry ID and the number of points needed prsently.
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

    # Returns nothing
    return "", 200


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

    # Finds the solution to be deleted.
    (solution,) = conn.execute(
        """
        SELECT solution FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
        INNER JOIN solutions ON entries.entry = solutions.entry
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
        AND question = ?
        AND solutions.text = ?
        """, (sheet_name, question, answer)
    ).fetchone()

    # Deletes that solution.
    conn.execute("DELETE FROM solutions WHERE solution = ?", (solution,))

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

    # Finds the entry that is receving a new answer.
    (entry,) = conn.execute(
        """
        SELECT entries.entry FROM entries
        INNER JOIN translators
            ON translators.translator = entries.translator
        INNER JOIN mentions ON mentions.entry = entries.entry
        INNER JOIN sheets ON mentions.sheet = sheets.sheet
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND sheets.name = ?
        AND question = ?
        """, (sheet_name, question)
    ).fetchone()

    # Adds the answer to the list of solutions.
    conn.execute(
        """
        INSERT INTO solutions (entry, text, displayed) VALUES
            (?, ?, 0);
        """, (entry, answer)
    )

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return "", 204
