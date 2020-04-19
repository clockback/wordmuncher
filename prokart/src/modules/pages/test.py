# Builtins
from flask import render_template, redirect, request, url_for
from typing import Dict, List, Tuple, Union

# Local imports
from prokart.src.application import app, max_rows
from prokart.src.modules.sheets import get_sheets
from prokart.src.modules.sql_handler import (
    get_connection, get_recent_translations
)


@app.route('/test')
def test() -> Tuple[str, int]:
    """Returns the page for the test area.
    :return: The test area page.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Prevents use of the page if there are no translators created yet,
    # redirecting instead to the languages page.
    if not any(conn.execute("SELECT 1 FROM translators")):
        return redirect(url_for("languages"))

    # Finds the sheets available for testing.
    sheets = get_sheets(populated_only=True)

    # Finds whether or not there are more sheets than immediately
    # viewable.
    load_more = len(sheets) > max_rows

    # Refreshes all of the entries' scoring.
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

    # Commits the changes.
    conn.commit()

    # Renders and returns the page.
    return render_template(
        "test.html", sheets=sheets[:max_rows], load_more=load_more,
        current_search=request.form.get("sheet query", ""),
        topbar=get_recent_translations()
    ), 204


@app.route('/test/search')
def test_search() -> Tuple[
    Dict[str, Union[List[Tuple[str, int, int]], bool]], int
]:
    """Finds the sheet details given the provided query.
    :return: The list of sheets and whether or not there are more to
        display.
    :rtype: Tuple[
        Dict[str, Union[List[Tuple[str, int, int]], bool]], int
    ]
    """
    # Finds the different search queries to use.
    queries = set(request.args["query"].split(' '))

    # Finds the sheets to be searched.
    sheets = get_sheets(queries)

    # Determines whether or not there are more sheets to be displayed.
    more_sheets = len(sheets) > max_rows

    # Returns the results.
    return {
        'sheets': sheets[:max_rows],
        'more_sheets': more_sheets,
    }, 200


@app.route('/test/load_more_sheets')
def test_load_more_sheets() -> Tuple[
    Dict[str, List[Tuple[str, int, int]]], int
]:
    """Loads more sheets to be displayed.
    :return: The additional sheets and information.
    :rtype: Tuple[Dict[str, List[Tuple[str, int, int]]], int]
    """
    # Finds the number of sheets already present.
    offset = int(request.args['already'])

    # Finds the different search queries to use.
    queries = set(request.args["query"].split(' '))

    # Finds the sheets to be displayed.
    sheets = get_sheets(searches=queries, offset=offset)

    # Returns the result.
    return {
        'more_sheets': len(sheets) > max_rows,
        'sheets': sheets[:max_rows]
    }, 200
