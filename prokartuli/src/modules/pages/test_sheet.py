from difflib import SequenceMatcher
from flask import abort, render_template, request
import json

from prokartuli.src.application import app
from prokartuli.src.modules.sql_handler import get_connection


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

    previous = list(filter(bool, json.loads(
        request.args.get("previous", "[]")
    )))

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
    already = int(request.args["already_attempted"])

    possible_solutions = conn.execute(
        """
        SELECT displayed, solutions.text FROM sheets
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
    ).fetchall()

    if answer in map(lambda x: x[1], possible_solutions):
        return {
            "correct": True,
            "close": True,
            "closest": None,
            "others": []
        }, 200

    best, best_ratio = None, 0

    for _, possible_solution in possible_solutions:
        result = SequenceMatcher(None, answer, possible_solution).ratio()
        if result >= 0.9 and not already:
            return {
                "correct": False,
                "close": True,
                "closest": None,
                "others": []
            }, 200
        elif result > best_ratio and result > 0.6:
            best, best_ratio = possible_solution, result

    if not best:
        best = next(filter(lambda x: x[0], possible_solutions))[1]

    return {
        "correct": False,
        "close": False,
        "closest": best,
        "others": [x[1] for x in possible_solutions if x[1] != best]
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


@app.route('/test_sheet/incorrect_answer')
def incorrect_answer():
    conn = get_connection()

    sheet = request.args["sheet"]
    question = request.args["question"]

    entry, needed = conn.execute(
        """
        SELECT entries.entry, needed FROM sheets
        INNER JOIN mentions ON sheets.sheet = mentions.sheet
        INNER JOIN entries ON entries.entry = mentions.entry
        WHERE sheets.name = ?
        AND question = ?;
        """, (sheet, question)
    ).fetchone()

    conn.execute(
        """
        UPDATE entries
            SET needed = ?, so_far = 0, completed = NULL
        WHERE entry = ?;
        """, (min((needed + 1, 10)), entry)
    )

    conn.commit()

    return {}, 200


@app.route('/test_sheet/remove_answer')
def remove_answer():
    conn = get_connection()

    sheet_name = request.args["sheet"]
    question = request.args["question"]
    answer = request.args["answer"]

    solution = conn.execute(
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
    ).fetchone()[0]

    conn.execute("DELETE FROM solutions WHERE solution = ?", (solution,))
    conn.commit()

    return {}, 204


@app.route('/test_sheet/add_answer')
def add_answer():
    conn = get_connection()

    sheet_name = request.args["sheet"]
    question = request.args["question"]
    answer = request.args["answer"]

    entry = conn.execute(
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
    ).fetchone()[0]

    conn.execute(
        """
        INSERT INTO solutions (entry, text, displayed) VALUES
            (?, ?, 0);
        """, (entry, answer)
    )
    conn.commit()

    return {}, 204
