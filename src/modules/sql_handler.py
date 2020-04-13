import sqlite3 as sql
from pathlib import Path
from typing import List, Optional


# Contains settings
max_rows = 5


def get_connection() -> sql.Connection:
    """Connects to the local database and constructs the required
    tables.
    :return: A connection to the database.
    :rtype: sql.Connection
    """
    home = Path.home()
    path = Path(home, ".prokartuli")
    if len(list(home.glob(".prokartuli"))) == 0:
        path.mkdir(parents=True, exist_ok=True)
    db_file = str(Path(path, "vocab.db"))
    return create_db(db_file)


def create_db(file: str) -> sql.Connection:
    """Structures the database.
    :return: A connection to the database.
    :rtype: sql.Connection
    """
    conn = sql.connect(file)
    # Allows foreign keys to be used.
    conn.execute("PRAGMA foreign_keys = ON;")

    # Creates the languages table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS languages (
            language INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR (40) NOT NULL,
            flag CHAR (2),
            CONSTRAINT one_name UNIQUE (name)
        );
        """
    )

    # Creates the translators table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS translators (
            translator INTEGER PRIMARY KEY AUTOINCREMENT,
            from_l INTEGER NOT NULL
                REFERENCES languages (language)
                    ON DELETE CASCADE,
            to_l INTEGER NOT NULL
                REFERENCES languages (language)
                    ON DELETE CASCADE,
            last_used CHAR (23) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT one_translation UNIQUE (from_l, to_l)
        );
        """
    )

    # Creates the sheets table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS sheets (
            sheet INTEGER PRIMARY KEY AUTOINCREMENT,
            translator INTEGER
                REFERENCES translators(translator)
                    ON DELETE CASCADE,
            name VARCHAR (80),
            CONSTRAINT name UNIQUE (translator, name)
        );
        """
    )

    # Creates the entries table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS entries (
            entry INTEGER PRIMARY KEY AUTOINCREMENT,
            translator INTEGER
                REFERENCES translators(translator)
                    ON DELETE CASCADE,
            question VARCHAR (80),
            points TINYINT DEFAULT 0,
            needed TINYINT DEFAULT 2,
            so_far TINYINT DEFAULT 0,
            completed CHAR (23),
            CONSTRAINT one_question_per_entry UNIQUE
                (translator, question)
        );
        """
    )

    # Creates the solutions table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS solutions (
            solution INTEGER PRIMARY KEY AUTOINCREMENT,
            entry INTEGER REFERENCES entries(entry)
                ON DELETE CASCADE,
            text VARCHAR (80),
            displayed BOOL,
            CONSTRAINT one_answer_per_question UNIQUE
                (entry, text)
        );
        """
    )

    # Creates the mentions table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS mentions (
            mention INTEGER PRIMARY KEY AUTOINCREMENT,
            sheet INTEGER REFERENCES sheets(sheet)
                ON DELETE CASCADE,
            entry INTEGER REFERENCES entries(entry)
                ON DELETE CASCADE,
            CONSTRAINT name UNIQUE (sheet, entry)
        );
        """
    )
    # Refreshes the connection. This prevents certain errors.
    conn.commit()
    conn.close()
    conn = sql.connect(file)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def get_recent_translations(
        conn: Optional[sql.Connection] = None
) -> List[str]:
    """Finds the most recent translations for displaying at the top
    of a page.
    :return: List[str]
    """
    if not conn:
        conn = get_connection()

    return conn.execute(
        """
        SELECT from_l, l1.name, l1.flag, to_l, l2.name, l2.flag FROM (
            SELECT from_l, to_l FROM translators
            ORDER BY last_used DESC
            LIMIT 3
        )
        INNER JOIN languages as l1
            ON l1.language = from_l
        INNER JOIN languages as l2
            ON l2.language = to_l
        """
    ).fetchall()


def check_sheet_exists(conn: sql.Connection, name: str) -> bool:
    """Checks whether or not a sheet with the provided name exists.
    :param sql.Connection conn: A connection to the SQLite database.
    :param str name: The name of the sheet for which to check.
    :return: Whether the sheet exists.
    :rtype: bool
    """
    return print(conn.execute(
        """
        SELECT * FROM sheets
        INNER JOIN translators
            ON translators.translator = sheets.translator
        WHERE sheets.name = ?
        """, (name,)
    ).fetchall()) is None


def last_insert_rowid(conn: sql.Connection) -> int:
    """Finds the last row ID to be inserted into a table.
    :param sql.Connection conn: A connection to the SQLite database.
    :return: Most recent row ID.
    :rtype: int
    """
    return conn.execute("SELECT last_insert_rowid();").fetchone()[0]


def escape(string: str) -> str:
    """Modifies the string so that it is appropriate for SQLITE
    LIKE comparisons.
    :param str string: The search term.
    :rtype: str
    :return: The string to be used in a SQLITE query."""
    return string.translate(str.maketrans({'_': ' _', '%': ' %'}))
