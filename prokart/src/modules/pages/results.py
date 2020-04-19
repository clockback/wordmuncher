# Builtins
import json
from typing import Dict, Tuple

# Installed packages
from flask import render_template, request

# Local imports
from prokart.src.application import app
from prokart.src.modules.sql_handler import (
    get_recent_translations, get_connection
)


@app.route('/results')
def results() -> Tuple[str, int]:
    """Returns the page for the results area.
    :return: The results area page.
    :type: Tuple[str, int]
    """
    return render_template(
        "results.html", topbar=get_recent_translations()
    ), 200


@app.route('/results/summary_table')
def summary_table() -> Tuple[Dict[str, Dict[str, Tuple[int, int, int]]], int]:
    """Returns the results from a test to be viewed.
    :return: The entries to be displayed in the table, along with the
        corresponding results.
    :rtype: Tuple[Dict[str, Dict[str, Tuple[int, int, int]]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the list of questions to be investigated.
    questions = json.loads(request.args["questions"])

    # Finds the scores that correspond to the questions.
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

    # Create a dictionary mapping questions to scores.
    return_entries = {question: scores for (question, *scores) in entries}

    # Return the result.
    return {"entries": return_entries}, 200
