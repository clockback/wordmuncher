# Builtins
from typing import Dict, List, Optional, Set, Tuple

# Installed packages
from flask import request

# Local imports
from prokart.src.application import app, max_rows
from prokart.src.modules.sql_handler import escape, get_connection


def get_sheets(
        searches: Optional[Set[str]] = None, offset: int = 0,
        populated_only: bool = False
) -> List[Tuple[str, int, int]]:
    """Finds the top sheets.
    :param Optional[Set[str]] searches: The different string
        combinations that must occur in the sheet names.
    :param int offset: How many sheets given the query have been
        returned already.
    :param bool populated_only: Whether or not to only consider sheets
        that have entries associated with them.
    :return: Each of the different sheets with the following values:
        * Name
        * Percentage complete
        * The number of entries
    :rtype: List[Tuple[str, int, int]]
    """
    # Establishes a connection.
    conn = get_connection()

    # Constructs the part of the query that filters the searches.
    search_queries = "\n".join(
        f"AND all_sheets.name LIKE '%' || ? || '%' ESCAPE ' '"
        for _search in searches
    ) if searches else ""

    # Creates a filter on sheets with entries if needed.
    populated_join = (
        "INNER JOIN mentions ON mentions.sheet = all_sheets.sheet"
        if populated_only else ""
    )
    populated_group = "GROUP BY all_sheets.sheet" if populated_only else ""

    # Returns the result of the SQLite query.
    return list(conn.execute(
        f"""
        SELECT
            name,
            IFNULL(CAST(
                100 * CAST(SUM(points) + COUNT(completed) AS FLOAT) / (
                    SUM(points) + COUNT(completed)
                        + SUM(needed - so_far != 0)
                ) AS INT
            ), 0) AS score,
            COUNT(entries.entry) AS no_entries
            FROM (
                SELECT all_sheets.sheet, name FROM sheets AS all_sheets
                {populated_join}
                WHERE all_sheets.translator = (
                    SELECT translator FROM translators
                    ORDER BY last_used DESC
                    LIMIT 1
                )
                {search_queries}
                {populated_group}
                ORDER BY LOWER(all_sheets.name)
                LIMIT {max_rows + 1} OFFSET ?
            ) AS sheets
        LEFT JOIN mentions ON mentions.sheet = sheets.sheet
        LEFT JOIN entries ON mentions.entry = entries.entry
        GROUP BY sheets.sheet
        ORDER BY LOWER(sheets.name)
        """, (*(map(escape, searches) if searches else ()), offset)
    ))


@app.route('/sheet_already_exists')
def sheet_already_exists() -> Tuple[Dict[str, bool], int]:
    """Returns a boolean for whether or not a sheet with the requested
    name exists.
    :return: Whether or not it exists.
    :rtype: Tuple[Dict[str, bool], int]
    """
    # Finds the name of the sheet to be found.
    name = request.args['name']

    # Finds the name of a sheet to be ignored even if it exists.
    prior = request.args.get('prior', None)

    # If the name is the same as the one ignored, returns False.
    if name == prior:
        return {'already_there': False}, 200

    # Establishes a connection.
    conn = get_connection()

    # Finds out whether the sheet exists or not.
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
        """, (request.args['name'],)
    ).fetchall())

    # Returns the result.
    return {'already_there': already_there}, 200
