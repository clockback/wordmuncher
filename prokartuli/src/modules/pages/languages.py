from typing import Tuple


from flask import redirect, render_template, request


from prokartuli.src.application import app
from prokartuli.src.modules.sql_handler import (
    get_connection, get_recent_translations
)


@app.route('/languages', methods=['POST', 'GET'])
def languages():
    conn = get_connection()

    if request.method == 'POST':
        from_l = request.form['translate_from']
        to_l = request.form['translate_to']
        conn.execute(
            f"""
            INSERT INTO translators
                (from_l, to_l)
            SELECT ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM translators
                WHERE from_l = ?
                    AND to_l = ?
            )
            """, (from_l, to_l, from_l, to_l)
         )
        conn.execute(
            """
            UPDATE translators
            SET last_used = datetime('now')
            WHERE from_l = ?
                AND to_l = ?;
            """, (from_l, to_l)
        )
        conn.commit()
        return redirect('/', code=302)
    else:
        ls = conn.execute("SELECT language, name, flag FROM languages")
        return render_template(
            "languages.html",
            topbar=get_recent_translations(conn),
            languages=list(enumerate(ls, 1))
        )


@app.route('/languages/set')
def set_languages() -> Tuple:
    """Changes the languages selection.
    :return: None
    """
    conn = get_connection()
    from_l = request.args['from']
    to_l = request.args['to']
    conn.execute(
        """
        UPDATE translators
        SET last_used = datetime('now')
        WHERE from_l = ?
            AND to_l = ?;
        """, (from_l, to_l)
    )
    conn.commit()
    return '', 204
