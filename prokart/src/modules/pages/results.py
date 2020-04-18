from flask import render_template, request
import json

from prokart.src.application import app
from prokart.src.modules.sql_handler import (
    get_recent_translations, get_connection
)


@app.route('/results')
def results():
    return render_template("results.html", topbar=get_recent_translations())


@app.route('/results/summary_table')
def summary_table():
    conn = get_connection()

    questions = json.loads(request.args["questions"])

    entries = conn.execute(
        f"""
        SELECT question, so_far, needed, points FROM entries
        INNER JOIN translators
            ON translators.translator = entries.translator
        WHERE last_used = (
            SELECT MAX(last_used) FROM translators
        )
        AND question IN ({', '.join('?' for _question in questions)});
        """, questions
    ).fetchall()

    return_entries = {answer: scores for (answer, *scores) in entries}

    return {"entries": return_entries}, 200
