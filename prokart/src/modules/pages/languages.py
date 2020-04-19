# Builtins
from typing import Dict, List, Tuple

# Installed packages
from flask import render_template, request

# Local imports
from prokart.src.application import app
from prokart.src.modules.sql_handler import (
    get_connection, get_recent_translations
)


@app.route('/languages/update_translator')
def update_translator() -> Tuple[str, int]:
    """Causes the translator to be treated as the most recently used
    translator.
    :return: Bare bones response.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the ID of the language from which the user is translating.
    (from_l,) = conn.execute(
        """
        SELECT language FROM languages WHERE name = ?;
        """, (request.args['from'],)
    ).fetchone()

    # Finds the ID of the language to which the user is translating.
    (to_l,) = conn.execute(
        """
        SELECT language FROM languages WHERE name = ?;
        """, (request.args['to'],)
    ).fetchone()

    # If the translator has not yet been added, adds it.
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

    # Makes sure that the translator is the most recently used.
    conn.execute(
        """
        UPDATE translators
        SET last_used = datetime('now')
        WHERE from_l = ?
            AND to_l = ?;
        """, (from_l, to_l)
    )

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return "", 204


@app.route('/languages')
def languages() -> Tuple[str, int]:
    """Returns the page for the language area.
    :return: The language area page.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the different languages currently available.
    ls = list(enumerate(conn.execute(
        """
        SELECT language, name, flags.text FROM languages
        INNER JOIN flags ON flags.flag = languages.flag;
        """
    ), 1))

    # Renders and returns the page.
    return render_template(
        "languages.html", topbar=get_recent_translations(conn), languages=ls
    ), 200


@app.route('/languages/set')
def set_languages() -> Tuple[str, int]:
    """Changes the languages selection.
    :return: Bare bones response.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the IDs for the languages in the translator.
    from_l = request.args['from']
    to_l = request.args['to']

    # Updates the translator to be the most recently used.
    conn.execute(
        """
        UPDATE translators
        SET last_used = datetime('now')
        WHERE from_l = ?
            AND to_l = ?;
        """, (from_l, to_l)
    )

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return '', 204


@app.route('/languages/check_language')
def check_languages() -> Tuple[Dict[str, bool], int]:
    """Returns whether or not the user has already made a language with
    the provided name.
    :return: Whether or not the language already exists.
    "rtype: Tuple[Dict[str, bool], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the name of the language to be checked.
    name = request.args['name']

    # Determines whether or not the language already exists.
    found = bool(conn.execute(
        """
        SELECT 1 FROM languages
        WHERE name = ?
        """, (name,)
    ).fetchone())

    # Returns the result.
    return {"found": found}, 200


@app.route('/languages/add_language')
def add_language() -> Tuple[str, int]:
    """Adds a language to the list of languages.
    :return: Bare bones response.
    :rtype: Tuple[str, int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds the name of the language and the associated flag.
    name = request.args["name"]
    flag = request.args["flag"]

    # Finds the ID of the flag.
    (flag_s,) = conn.execute(
        "SELECT flag FROM flags WHERE text = ?;", (flag,)
    ).fetchone()

    # Adds the new language to the database.
    conn.execute(
        """
        INSERT INTO languages (name, flag) VALUES (?, ?);
        """, (name, flag_s)
    )

    # Commits the changes.
    conn.commit()

    # Returns nothing.
    return "", 204


@app.route('/languages/get_flags')
def get_flags() -> Tuple[Dict[str, List[Tuple[str, str]]], int]:
    """Finds all the flags and the associated country.
    :return: The flags and countries.
    :rtype: Tuple[Dict[str, List[Tuple[str, str]]], int]
    """
    # Establishes a connection.
    conn = get_connection()

    # Finds all of the flags and countries.
    flags = conn.execute("SELECT text, country FROM flags;").fetchall()

    # Returns the result.
    return {"flags": flags}, 200
