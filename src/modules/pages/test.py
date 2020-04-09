from flask import render_template, request


from ...application import app
from src.modules.sql_handler import get_connection, get_recent_translations


# Contains settings
max_sheets = 5


@app.route('/test')
def test():
    cur = get_connection().cursor()
    sheets = list(cur.execute(
        f"""
        SELECT
            name,
            COUNT(*),
            CAST(
                100 * CAST(SUM(completed) AS FLOAT)
                    / (SUM(completed) + SUM(needed - so_far != 0))
                AS INT
            )
            FROM mentions
        INNER JOIN sheets
            ON mentions.sheet = sheets.sheet
        INNER JOIN entries
            ON mentions.entry = entries.entry
            WHERE sheets.sheet IN (
                SELECT sheet FROM sheets
                WHERE translator = 1
                ORDER BY NAME
                LIMIT {max_sheets + 1}
            )
        GROUP BY sheets.sheet;
        """
    ))

    load_more = len(sheets) > max_sheets
    conn = get_connection()
    return render_template(
        "test.html", sheets=sheets[:max_sheets], load_more=load_more,
        current_search=request.form.get("sheet query", ""),
        topbar=get_recent_translations(conn)
    )


@app.route('/test/search')
def test_search():
    html = ""
    cur = get_connection().cursor()
    sheets = list(cur.execute(
        f"""
        SELECT
            name,
            COUNT(*),
            CAST(
                100 * CAST(SUM(completed) AS FLOAT)
                    / (SUM(completed) + SUM(needed - so_far != 0))
                AS INT
            )
            FROM mentions
        INNER JOIN sheets
            ON mentions.sheet = sheets.sheet
        INNER JOIN entries
            ON mentions.entry = entries.entry
            WHERE sheets.sheet IN (
                SELECT sheet FROM sheets
                WHERE translator = 1
                    AND name LIKE ?
                ORDER BY NAME
                LIMIT {max_sheets + 1} OFFSET ?
            )
        GROUP BY sheets.sheet;
        """, (f"%{request.args['q']}%", int(request.args['n']))
    ))

    load_more = len(sheets) > max_sheets

    for sheet, no_entries, completed in sheets[:max_sheets]:
        html += f"""
        <tr>
            <td>{sheet}</td>
            <td>{completed}</td>
            <td>{no_entries}</td>
        </tr>
        """

    return (
        {'html': html, 'load_more': load_more}, 200,
        {'Content-Type': 'text/json'}
    )
