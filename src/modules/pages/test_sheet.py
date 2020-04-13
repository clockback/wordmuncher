from difflib import SequenceMatcher
from flask import abort, render_template, request

from ...application import app
from ..sql_handler import get_connection


@app.route('/test/<path:sheet_name>')
def test_sheet(sheet_name: str):
    conn = get_connection()
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
    if found:
        return render_template("test_sheet.html", sheet_name=sheet_name)
    else:
        abort(404)


@app.route('/test_sheet/get_question')
def get_question():
    conn = get_connection()

    question, points, needed, so_far = conn.execute(
        """
        SELECT question, points, needed, so_far FROM sheets
        INNER JOIN mentions ON mentions.sheet = sheets.sheet
        INNER JOIN entries ON mentions.entry = entries.entry
        INNER JOIN translators
            ON translators.translator = sheets.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND name = ?
        LIMIT 1
        """,
        (request.args['sheet'],)
    ).fetchone()

    return {
        "question": question,
        "points": points,
        "needed": needed,
        "so_far": so_far
    }, 200


@app.route('/test_sheet/check_answer')
def check_answer():
    conn = get_connection()

    sheet = request.args["sheet"]
    question = request.args["question"]
    answer = request.args["answer"]

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
        """, (sheet, question)
    ).fetchall()]

    if answer in possible_solutions:
        return {
            "correct": True,
            "close": True,
        }, 200

    for possible_solution in possible_solutions:
        if SequenceMatcher(None, answer, possible_solution).ratio() >= 0.9:
            return {
                "correct": False,
                "close": True
            }

    return {
        "correct": False,
        "close": False
    }, 200


@app.route('/test_sheet/correct_answer')
def correct_answer():
    conn = get_connection()

    sheet = request.args["sheet"]
    question = request.args["question"]

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
        if so_far + 1 == needed:
            so_far = needed = 2
        else:
            so_far += 1

    conn.execute(
        """
        UPDATE entries
            SET needed = ?, so_far = ?, completed = ?
        WHERE entry = ?;
        """, (needed, so_far, completed, entry)
    )

    conn.commit()

    return {
        "needed": needed,
        "so_far": so_far
    }, 200

