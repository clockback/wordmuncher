from typing import List, Optional, Set
from flask import request

from ..application import app
from .sql_handler import escape, get_connection, max_rows


def get_sheets(
        searches: Optional[Set[str]] = None, offset: int = 0,
        populated_only: bool = False
) -> List:
    conn = get_connection()

    # Constructs the part of the query that filters the searches.
    search_queries = "\n".join(
        f"AND all_sheets.name LIKE '%' || ? || '%' ESCAPE ' '"
        for _search in searches
    ) if searches else ""

    populated_join = (
        "INNER JOIN mentions ON mentions.sheet = all_sheets.sheet"
        if populated_only else ""
    )
    populated_group = "GROUP BY all_sheets.sheet" if populated_only else ""

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
def sheet_already_exists():
    name = request.args['name']
    prior = request.args.get('prior', None)

    if name == prior:
        return {'already_there': False}, 200

    conn = get_connection()
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

    return {'already_there': already_there}, 200
