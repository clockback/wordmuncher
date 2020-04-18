from typing import Dict, Tuple


from flask import redirect, render_template, request, url_for


from prokartuli.src.application import app
from prokartuli.src.modules.sql_handler import (
    get_connection, get_recent_translations
)


@app.route('/languages/update_translator')
def update_translator():
    conn = get_connection()

    (from_l,) = conn.execute(
        """
        SELECT language FROM languages WHERE name = ?;
        """, (request.args['from'],)
    ).fetchone()

    (to_l,) = conn.execute(
        """
        SELECT language FROM languages WHERE name = ?;
        """, (request.args['to'],)
    ).fetchone()

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
    return "", 204


@app.route('/languages')
def languages():
    conn = get_connection()

    ls = conn.execute("SELECT language, name, flag FROM languages;")
    return render_template(
        "languages.html",
        topbar=get_recent_translations(conn),
        languages=list(enumerate(ls, 1))
    )


@app.route('/languages/set')
def set_languages() -> Tuple[str, int]:
    """Changes the languages selection."""
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


@app.route('/languages/check_language')
def check_languages() -> Tuple[Dict[str, bool], int]:
    """Returns whether or not the user has already made a language with
    the provided name.
    """
    conn = get_connection()
    name = request.args['name']
    found = bool(conn.execute(
        """
        SELECT 1 FROM languages
        WHERE name = ?
        """, (name,)
    ).fetchone())
    return {"found": found}, 200


@app.route('/languages/add_language')
def add_language():
    conn = get_connection()

    name = request.args["name"]
    flag = request.args["flag"]

    conn.execute(
        """
        INSERT INTO languages (name, flag) VALUES (?, ?);
        """, (name, flag)
    )
    conn.commit()

    return "", 204


@app.route('/languages/get_flags')
def get_flags():
    conn = get_connection()

    flags = conn.execute("SELECT text, country FROM flags;").fetchall()

    return {"flags": flags}, 200
