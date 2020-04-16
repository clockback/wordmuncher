from flask import render_template, request
from typing import Dict, Tuple

from ...application import app
from ..sheets import get_sheets, max_rows
from src.modules.sql_handler import get_connection, get_recent_translations


@app.route('/test')
def test():
    sheets = get_sheets()
    load_more = len(sheets) > max_rows

    conn = get_connection()

    # Refreshes all of the entries.
    conn.execute(
        """
        UPDATE entries SET points = points + 1, completed = NULL,
            so_far = 0
        WHERE completed IS NOT NULL AND
            (datetime('now') > datetime(completed, '+1 day')
                and points = 0)
            OR (datetime('now') > datetime(completed, '+7 day')
                and points = 1)
            OR (datetime('now') > datetime(completed, '+1 month')
                and points = 2)
            OR (datetime('now') > datetime(completed, '+3 month')
                and points = 3)
        """
    )
    conn.commit()

    return render_template(
        "test.html", sheets=sheets[:max_rows], load_more=load_more,
        current_search=request.form.get("sheet query", ""),
        topbar=get_recent_translations()
    )


@app.route('/test/search')
def test_search():
    queries = set(request.args["query"].split(' '))
    sheets = get_sheets(queries)
    more_sheets = len(sheets) > max_rows

    return {
        'sheets': sheets[:max_rows],
        'more_sheets': more_sheets,
    }, 200


@app.route('/test/load_more_sheets')
def test_load_more_sheets() -> Tuple[Dict[str, str], int]:
    offset = int(request.args['already'])
    searches = request.args["query"].split(' ')
    sheets = get_sheets(searches=searches, offset=offset)

    return {
        'more_sheets': len(sheets) > max_rows,
        'sheets': sheets[:max_rows]
    }, 200
