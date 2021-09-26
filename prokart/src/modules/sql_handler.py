# Builtins
from itertools import chain, count, repeat
import json
import sqlite3 as sql
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union

# Local imports
from prokart.src.application import app


def get_connection() -> sql.Connection:
    """Connects to the local database and constructs the required
    tables.
    :return: A connection to the database.
    :rtype: sqlite3.Connection
    """
    # References a database outside of the .prokart folder if explicitly
    # given.
    if app.config["PATH"]:
        path = app.config["PATH"]

    # Finds the path to the .prokart folder if none explicitly given.
    else:
        home = Path.home()
        path = Path(home, ".prokart")

        # If the folder for prokart does not yet exist, creates it.
        if len(list(home.glob(".prokart"))) == 0:
            path.mkdir(parents=True, exist_ok=True)

    db_file = str(Path(path, app.config["DATABASE"]))

    # Returns a connection to the database. Will also set up the
    # database if required.
    return create_db(db_file)


def create_db(file: str) -> sql.Connection:
    """Structures the database.
    :param str file: The path to the database to be created.
    :return: A connection to the database.
    :rtype: sqlite3.Connection
    """
    # Connect to the database.
    conn = sql.connect(file)

    # Allows foreign keys to be used.
    conn.execute("PRAGMA foreign_keys = ON;")

    # Stops if there are already 11 tables in the database, including
    # sqlite_sequence as the eighth.
    if conn.execute(
        "SELECT COUNT() FROM sqlite_master WHERE type = 'table';"
    ).fetchone()[0] == 11:
        return conn

    # Creates the flags table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS flags (
            flag INTEGER PRIMARY KEY AUTOINCREMENT,
            text CHAR(4) NOT NULL,
            country VARCHAR(40) NOT NULL,
            CONSTRAINT one_flag UNIQUE (text)
            CONSTRAINT country UNIQUE (country)
        );
        """
    )

    # Populates the flags table.
    if not conn.execute(
        """
        SELECT 1 FROM flags
        LIMIT 1;
        """
    ).fetchone():
        conn.execute(
            """
            INSERT INTO flags (text, country) VALUES
            ('🇦🇨', 'Ascension Island'),
            ('🇦🇩', 'Andorra'),
            ('🇦🇪', 'United Arab Emirates'),
            ('🇦🇫', 'Afghanistan'),
            ('🇦🇬', 'Antigua & Barbuda'),
            ('🇦🇮', 'Anguilla'),
            ('🇦🇱', 'Albania'),
            ('🇦🇲', 'Armenia'),
            ('🇦🇴', 'Angola'),
            ('🇦🇶', 'Antarctica'),
            ('🇦🇷', 'Argentina'),
            ('🇦🇸', 'American Samoa'),
            ('🇦🇹', 'Austria'),
            ('🇦🇺', 'Australia'),
            ('🇦🇼', 'Aruba'),
            ('🇦🇽', 'Åland Islands'),
            ('🇦🇿', 'Azerbaijan'),
            ('🇧🇦', 'Bosnia & Herzegovina'),
            ('🇧🇧', 'Barbados'),
            ('🇧🇩', 'Bangladesh'),
            ('🇧🇪', 'Belgium'),
            ('🇧🇫', 'Burkina Faso'),
            ('🇧🇬', 'Bulgaria'),
            ('🇧🇭', 'Bahrain'),
            ('🇧🇮', 'Burundi'),
            ('🇧🇯', 'Benin'),
            ('🇧🇱', 'St. Barthélemy'),
            ('🇧🇲', 'Bermuda'),
            ('🇧🇳', 'Brunei'),
            ('🇧🇴', 'Bolivia'),
            ('🇧🇶', 'Caribbean Netherlands'),
            ('🇧🇷', 'Brazil'),
            ('🇧🇸', 'Bahamas'),
            ('🇧🇹', 'Bhutan'),
            ('🇧🇼', 'Botswana'),
            ('🇧🇾', 'Belarus'),
            ('🇧🇿', 'Belize'),
            ('🇨🇦', 'Canada'),
            ('🇨🇨', 'Cocos (Keeling) Islands'),
            ('🇨🇩', 'Democratic Republic of the Congo'),
            ('🇨🇫', 'Central African Republic'),
            ('🇨🇬', 'Republic of the Congo'),
            ('🇨🇭', 'Switzerland'),
            ('🇨🇮', "Ivory Coast"),
            ('🇨🇰', 'Cook Islands'),
            ('🇨🇱', 'Chile'),
            ('🇨🇲', 'Cameroon'),
            ('🇨🇳', 'China'),
            ('🇨🇴', 'Colombia'),
            ('🇨🇷', 'Costa Rica'),
            ('🇨🇺', 'Cuba'),
            ('🇨🇻', 'Cape Verde'),
            ('🇨🇼', 'Curaçao'),
            ('🇨🇽', 'Christmas Island'),
            ('🇨🇾', 'Cyprus'),
            ('🇨🇿', 'Czech Republic'),
            ('🇩🇪', 'Germany'),
            ('🇩🇬', 'Diego Garcia'),
            ('🇩🇯', 'Djibouti'),
            ('🇩🇰', 'Denmark'),
            ('🇩🇲', 'Dominica'),
            ('🇩🇴', 'Dominican Republic'),
            ('🇩🇿', 'Algeria'),
            ('🇪🇨', 'Ecuador'),
            ('🇪🇪', 'Estonia'),
            ('🇪🇬', 'Egypt'),
            ('🇪🇭', 'Western Sahara'),
            ('🇪🇷', 'Eritrea'),
            ('🇪🇸', 'Spain'),
            ('🇪🇹', 'Ethiopia'),
            ('🇪🇺', 'European Union'),
            ('🇫🇮', 'Finland'),
            ('🇫🇯', 'Fiji'),
            ('🇫🇰', 'Falkland Islands'),
            ('🇫🇲', 'Micronesia'),
            ('🇫🇴', 'Faroe Islands'),
            ('🇫🇷', 'France'),
            ('🇬🇦', 'Gabon'),
            ('🇬🇧', 'United Kingdom'),
            ('🇬🇩', 'Grenada'),
            ('🇬🇪', 'Georgia'),
            ('🇬🇫', 'French Guiana'),
            ('🇬🇬', 'Guernsey'),
            ('🇬🇭', 'Ghana'),
            ('🇬🇮', 'Gibraltar'),
            ('🇬🇱', 'Greenland'),
            ('🇬🇲', 'Gambia'),
            ('🇬🇳', 'Guinea'),
            ('🇬🇵', 'Guadeloupe'),
            ('🇬🇶', 'Equatorial Guinea'),
            ('🇬🇷', 'Greece'),
            ('🇬🇸', 'South Georgia & South Sandwich Islands'),
            ('🇬🇹', 'Guatemala'),
            ('🇬🇺', 'Guam'),
            ('🇬🇼', 'Guinea-Bissau'),
            ('🇬🇾', 'Guyana'),
            ('🇭🇰', 'Hong Kong'),
            ('🇭🇳', 'Honduras'),
            ('🇭🇷', 'Croatia'),
            ('🇭🇹', 'Haiti'),
            ('🇭🇺', 'Hungary'),
            ('🇮🇨', 'Canary Islands'),
            ('🇮🇩', 'Indonesia'),
            ('🇮🇪', 'Ireland'),
            ('🇮🇱', 'Israel'),
            ('🇮🇲', 'Isle of Man'),
            ('🇮🇳', 'India'),
            ('🇮🇴', 'British Indian Ocean Territory'),
            ('🇮🇶', 'Iraq'),
            ('🇮🇷', 'Iran'),
            ('🇮🇸', 'Iceland'),
            ('🇮🇹', 'Italy'),
            ('🇯🇪', 'Jersey'),
            ('🇯🇲', 'Jamaica'),
            ('🇯🇴', 'Jordan'),
            ('🇯🇵', 'Japan'),
            ('🇰🇪', 'Kenya'),
            ('🇰🇬', 'Kyrgyzstan'),
            ('🇰🇭', 'Cambodia'),
            ('🇰🇮', 'Kiribati'),
            ('🇰🇲', 'Comoros'),
            ('🇰🇳', 'St. Kitts & Nevis'),
            ('🇰🇵', 'North Korea'),
            ('🇰🇷', 'South Korea'),
            ('🇰🇼', 'Kuwait'),
            ('🇰🇾', 'Cayman Islands'),
            ('🇰🇿', 'Kazakhstan'),
            ('🇱🇦', 'Laos'),
            ('🇱🇧', 'Lebanon'),
            ('🇱🇨', 'St. Lucia'),
            ('🇱🇮', 'Liechtenstein'),
            ('🇱🇰', 'Sri Lanka'),
            ('🇱🇷', 'Liberia'),
            ('🇱🇸', 'Lesotho'),
            ('🇱🇹', 'Lithuania'),
            ('🇱🇺', 'Luxembourg'),
            ('🇱🇻', 'Latvia'),
            ('🇱🇾', 'Libya'),
            ('🇲🇦', 'Morocco'),
            ('🇲🇨', 'Monaco'),
            ('🇲🇩', 'Moldova'),
            ('🇲🇪', 'Montenegro'),
            ('🇲🇫', 'St. Martin'),
            ('🇲🇬', 'Madagascar'),
            ('🇲🇭', 'Marshall Islands'),
            ('🇲🇰', 'North Macedonia'),
            ('🇲🇱', 'Mali'),
            ('🇲🇲', 'Myanmar'),
            ('🇲🇳', 'Mongolia'),
            ('🇲🇴', 'Macau'),
            ('🇲🇵', 'Northern Mariana Islands'),
            ('🇲🇶', 'Martinique'),
            ('🇲🇷', 'Mauritania'),
            ('🇲🇸', 'Montserrat'),
            ('🇲🇹', 'Malta'),
            ('🇲🇺', 'Mauritius'),
            ('🇲🇻', 'Maldives'),
            ('🇲🇼', 'Malawi'),
            ('🇲🇽', 'Mexico'),
            ('🇲🇾', 'Malaysia'),
            ('🇲🇿', 'Mozambique'),
            ('🇳🇦', 'Namibia'),
            ('🇳🇨', 'New Caledonia'),
            ('🇳🇪', 'Niger'),
            ('🇳🇫', 'Norfolk Island'),
            ('🇳🇬', 'Nigeria'),
            ('🇳🇮', 'Nicaragua'),
            ('🇳🇱', 'Netherlands'),
            ('🇳🇴', 'Norway'),
            ('🇳🇵', 'Nepal'),
            ('🇳🇷', 'Nauru'),
            ('🇳🇺', 'Niue'),
            ('🇳🇿', 'New Zealand'),
            ('🇴🇲', 'Oman'),
            ('🇵🇦', 'Panama'),
            ('🇵🇪', 'Peru'),
            ('🇵🇫', 'French Polynesia'),
            ('🇵🇬', 'Papua New Guinea'),
            ('🇵🇭', 'Philippines'),
            ('🇵🇰', 'Pakistan'),
            ('🇵🇱', 'Poland'),
            ('🇵🇲', 'St. Pierre & Miquelon'),
            ('🇵🇳', 'Pitcairn Islands'),
            ('🇵🇷', 'Puerto Rico'),
            ('🇵🇸', 'Palestine'),
            ('🇵🇹', 'Portugal'),
            ('🇵🇼', 'Palau'),
            ('🇵🇾', 'Paraguay'),
            ('🇶🇦', 'Qatar'),
            ('🇷🇪', 'Réunion'),
            ('🇷🇴', 'Romania'),
            ('🇷🇸', 'Serbia'),
            ('🇷🇺', 'Russia'),
            ('🇷🇼', 'Rwanda'),
            ('🇸🇦', 'Saudi Arabia'),
            ('🇸🇧', 'Solomon Islands'),
            ('🇸🇨', 'Seychelles'),
            ('🇸🇩', 'Sudan'),
            ('🇸🇪', 'Sweden'),
            ('🇸🇬', 'Singapore'),
            ('🇸🇭', 'St. Helena'),
            ('🇸🇮', 'Slovenia'),
            ('🇸🇰', 'Slovakia'),
            ('🇸🇱', 'Sierra Leone'),
            ('🇸🇲', 'San Marino'),
            ('🇸🇳', 'Senegal'),
            ('🇸🇴', 'Somalia'),
            ('🇸🇷', 'Suriname'),
            ('🇸🇸', 'South Sudan'),
            ('🇸🇹', 'São Tomé & Príncipe'),
            ('🇸🇻', 'El Salvador'),
            ('🇸🇽', 'Sint Maarten'),
            ('🇸🇾', 'Syria'),
            ('🇸🇿', 'Eswatini'),
            ('🇹🇦', 'Tristan da Cunha'),
            ('🇹🇨', 'Turks & Caicos Islands'),
            ('🇹🇩', 'Chad'),
            ('🇹🇫', 'French Southern Territories'),
            ('🇹🇬', 'Togo'),
            ('🇹🇭', 'Thailand'),
            ('🇹🇯', 'Tajikistan'),
            ('🇹🇰', 'Tokelau'),
            ('🇹🇱', 'East Timor'),
            ('🇹🇲', 'Turkmenistan'),
            ('🇹🇳', 'Tunisia'),
            ('🇹🇴', 'Tonga'),
            ('🇹🇷', 'Turkey'),
            ('🇹🇹', 'Trinidad & Tobago'),
            ('🇹🇻', 'Tuvalu'),
            ('🇹🇼', 'Taiwan'),
            ('🇹🇿', 'Tanzania'),
            ('🇺🇦', 'Ukraine'),
            ('🇺🇬', 'Uganda'),
            ('🇺🇳', 'United Nations'),
            ('🇺🇸', 'United States'),
            ('🇺🇾', 'Uruguay'),
            ('🇺🇿', 'Uzbekistan'),
            ('🇻🇦', 'Vatican City'),
            ('🇻🇨', 'St. Vincent & Grenadines'),
            ('🇻🇪', 'Venezuela'),
            ('🇻🇬', 'British Virgin Islands'),
            ('🇻🇮', 'U.S. Virgin Islands'),
            ('🇻🇳', 'Vietnam'),
            ('🇻🇺', 'Vanuatu'),
            ('🇼🇫', 'Wallis & Futuna'),
            ('🇼🇸', 'Samoa'),
            ('🇽🇰', 'Kosovo'),
            ('🇾🇪', 'Yemen'),
            ('🇾🇹', 'Mayotte'),
            ('🇿🇦', 'South Africa'),
            ('🇿🇲', 'Zambia'),
            ('🇿🇼', 'Zimbabwe')
            """
        )

    # Creates the languages table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS languages (
            language INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR (40) NOT NULL,
            flag INTEGER NOT NULL
                REFERENCES flags (flag)
                    ON DELETE CASCADE,
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

    # Creates the schemas table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS schemas (
            schema INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(80) NOT NULL
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
            schema INTEGER REFERENCES schemas(schema)
                ON DELETE CASCADE,
            question VARCHAR (80),
            points TINYINT DEFAULT 0,
            needed TINYINT DEFAULT 2,
            so_far TINYINT DEFAULT 0,
            completed CHAR (23),
            solutions TEXT,
            CONSTRAINT one_question_per_entry UNIQUE
                (translator, question)
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

    # Creates the subschemas table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS subschemas (
            subschema INTEGER PRIMARY KEY AUTOINCREMENT,
            schema INTEGER REFERENCES schemas(schema)
                ON DELETE CASCADE,
            name VARCHAR(80) NOT NULL,
            pos INTEGER
        );
        """
    )

    # Creates the qualities table.
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS qualities (
            quality INTEGER PRIMARY KEY AUTOINCREMENT,
            subschema INTEGER REFERENCES subschemas(subschema)
                ON DELETE CASCADE,
            name VARCHAR(80),
            pos INTEGER
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
) -> List[Tuple[int, str, str, int, str, str]]:
    """Finds the most recent translations for displaying at the top
    of a page.
    :param Optional[sql.Connection] conn: A connection to the database.
        If one is not provided, connects itself.
    :return: A list of the three most recently used translator rows,
        with each row containing the serials, names, and flags of each
        of the constituent languages.
    :rtype: List[Tuple[int, str, str, int, str, str]]
    """
    # Establishes a connection if one does not already exist.
    if not conn:
        conn = get_connection()

    # Returns the results.
    return conn.execute(
        """
        SELECT from_l, l1.name, f1.text, to_l, l2.name, f2.text FROM (
            SELECT from_l, to_l FROM translators
            ORDER BY last_used DESC
            LIMIT 3
        )
        INNER JOIN languages AS l1
            ON l1.language = from_l
        INNER JOIN languages AS l2
            ON l2.language = to_l
        INNER JOIN flags AS f1
            ON l1.flag = f1.flag
        INNER JOIN flags AS f2
            ON l2.flag = f2.flag
        """
    ).fetchall()


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
    :return: The string to be used in a SQLITE query.
    :rtype: str
    """
    return string.translate(str.maketrans({'_': ' _', '%': ' %'}))


def get_schemas(
        conn: Optional[sql.Connection] = None
) -> List[Tuple[int, str]]:
    """Finds the all schemas in the database.
    :return: The list of all schemas in the database, containing tuples
        of their id and names.
    :rtype: List[Tuple[int, str]]
    """
    if not conn:
        conn = get_connection()

    return conn.execute(
        """
        SELECT schema, name FROM schemas
        ORDER BY name;
        """
    ).fetchall()


def save_new_schema(
        conn: sql.Connection, name: str,
        structure: Dict[str, Dict[str, List[List[str]]]]
) -> int:
    """Saves the new schema.
    :param sql.Connection conn: A connection to the SQLite database.
    :param str name: The name of the schema.
    :param Dict[str, Dict[str, List[List[str]]]] structure:
    :return: The schema id.
    :rtype: int
    """
    conn.execute(
        """
        INSERT INTO schemas (name) VALUES
            (?);
        """, (name,)
    )

    # Finds the id for the new schema.
    schema_s = last_insert_rowid(conn)

    # Adds each of the subschemas and their qualities.
    for i, subs in enumerate(structure):
        # Extracts the subschema name and quality names.
        (name, (_, qualities)), = structure[subs].items()

        # Adds the subschema.
        conn.execute(
            """
            INSERT INTO subschemas (schema, name, pos) VALUES
                (?, ?, ?);
            """, (schema_s, name, i)
        )

        # Finds the id for the subschema.
        subschema_s = last_insert_rowid(conn)

        # Adds the subschema's qualities.
        conn.execute(
            f"""
            INSERT INTO qualities (subschema, name, pos) VALUES
                (?, ?, ?){", (?, ?, ?)" * (len(qualities) - 1)};
            """, tuple(chain(*zip(
                repeat(subschema_s), (x[0] for x in qualities), count()
            )))
        )

    # Saves the changes.
    conn.commit()

    return schema_s


def save_edit_schema(
        conn: sql.Connection, name: str, structure: Dict[
            str, Dict[str, List[Union[str, List[List[str]]]]]
        ], orig_name: str, answers: Dict[str, Union[str, Dict[str, str]]]
) -> Tuple[int, Dict[str, Union[str, Dict[str, str]]]]:
    """Saves the edited schema.
    :param sql.Connection conn: A connection to the SQLite database.
    :param str name: The new name of the schema.
    :param Dict[str, Dict[str, List[Union[str, List[List[str]]]]]] structure:
        The subschemas with their respective qualities, positions, etc.
    :param str orig_name: The original name of the schema.
    :param Dict[str, Union[str, Dict[str, str]]] answers: The answers to
        be changed appropriately.
    :return: The schema id and the dictionary for the answers.
    :rtype: Tuple[int, Dict[str, Union[str, Dict[str, str]]]]
    """
    # Finds the id for the old schema.
    schema_s, = conn.execute(
        """
        SELECT schema FROM schemas
        WHERE name = ?
        """, (orig_name,)
    ).fetchone()

    # Finds the original subschemas for the schema.
    orig_subschemas = [x[0] for x in conn.execute(
        """
        SELECT subschema FROM subschemas
        WHERE schema = ?
        ORDER BY pos;
        """, (schema_s,)
    ).fetchall()]

    # Finds the original number of subschemas.
    orig_no_subschemas = len(orig_subschemas)

    # Finds the original qualities for the subschemas.
    orig_qualities = conn.execute(
        f"""
        SELECT subschema, quality FROM qualities
        WHERE subschema IN ({",".join("?" * orig_no_subschemas)})
        ORDER BY subschema, pos;
        """, tuple(orig_subschemas)
    ).fetchall()

    # Updates the schema's name.
    conn.execute(
        """
        UPDATE schemas
        SET name = ?
        WHERE name = ?
        """, (name, orig_name)
    )

    all_subschemas = tuple(
        next(iter(i.values()))[0] for i in structure.values()
    )

    # Removes all subschemas no longer in use.
    conn.execute(
        f"""
        DELETE FROM subschemas
        WHERE schema = ?
            AND subschema NOT IN ({",".join("?" * len(structure))});
        """, (schema_s, *all_subschemas)
    )

    all_qualities = tuple(x[1] for x in chain(
        *(next(iter(i.values()))[1] for i in structure.values())
    ) if len(x) > 1)

    # Removes all qualities no longer in use.
    conn.execute(
        f"""
        DELETE FROM qualities
        WHERE subschema IN ({",".join("?" * len(structure))})
            AND quality NOT IN ({",".join("?" * len(all_qualities))})
        """, (
            *all_subschemas, *all_qualities
        )
    )

    # Iterates over each subschema.
    for i, subschema in enumerate(structure):
        # Finds the subschema's name, id, and qualities.
        (name, (subschema_s, qualities)), *_ = structure[subschema].items()

        # Updates the names of subschema.
        conn.execute(
            """
            UPDATE subschemas
            SET name = ?, pos = ?
            WHERE subschema = ?;
            """, (name, i, subschema_s)
        )

        # Adds new subschemas if it does not exist.
        if int(subschema_s) == -1:
            conn.execute(
                """
                INSERT INTO subschemas (schema, name, pos) VALUES
                    (?, ?, ?);
                """, (schema_s, name, i)
            )
            subschema_s = last_insert_rowid(conn)

        # Updates the names of subschema.
        for j, (q_name, *quality_s) in enumerate(qualities):
            if quality_s and int(quality_s[0]) != -1:
                conn.execute(
                    """
                    UPDATE qualities
                    SET name = ?, pos = ?
                    WHERE quality = ?;
                    """, (q_name, j, *quality_s)
                )
            else:
                conn.execute(
                    """
                    INSERT INTO qualities (subschema, name, pos) VALUES
                        (?, ?, ?);
                    """, (subschema_s, q_name, j)
                )

    # Finds the updated subschemas for the schema.
    updated_subschemas = [x[0] for x in conn.execute(
        """
        SELECT subschema FROM subschemas
        WHERE schema = ?
        ORDER BY pos;
        """, (schema_s,)
    ).fetchall()]

    # Finds the updated number of subschemas.
    updated_no_subschemas = len(updated_subschemas)

    # Finds the updated qualities for the subschemas.
    updated_qualities = conn.execute(
        f"""
        SELECT subschema, quality FROM qualities
        WHERE subschema IN ({",".join("?" * updated_no_subschemas)})
        ORDER BY subschema, pos;
        """, tuple(updated_subschemas)
    ).fetchall()

    # Updates all the answers as needed.
    update_answers(
        conn, structure, schema_s,
        orig_subschemas, orig_no_subschemas, orig_qualities,
        updated_subschemas, updated_no_subschemas, updated_qualities
    )

    # Saves the changes.
    conn.commit()

    # Inverts answers if the subschemas have been swapped.
    if (
        len(orig_subschemas) == 2
        and orig_subschemas[::-1] == updated_subschemas
    ):
        answers = invert_answers(answers)

    return schema_s, answers


def invert_answers(
        answers: Dict[str, Dict[str, str]]
) -> Dict[str, Dict[str, str]]:
    """Inverts the answers for when a subschema swap occurs.
    :param Dict[str, Dict[str, str]] answers:
    :return: The inverted answers.
    """
    inverted = {}
    for column in answers:
        if column == 'name':
            continue

        for row in answers[column]:
            if row not in inverted:
                inverted[row] = {}
            inverted[row][column] = answers[column][row]

    return inverted


def update_answers(
        conn: sql.Connection,
        structure: Dict[str, Dict[str, List[Union[str, List[List[str]]]]]],
        schema_s: int,
        orig_subschemas: List[int],
        orig_no_subschemas: int,
        orig_qualities: List[Tuple[int, int]],
        updated_subschemas: List[int],
        updated_no_subschemas: int,
        updated_qualities: List[Tuple[int, int]]
) -> None:
    """Modifies all solutions to have the appropriate form after a
    schema change.
    :param sql.Connection conn: A connection to the SQLite database.
    :param Dict[str, Dict[str, List[Union[str, List[List[str]]]]]] structure:
        The subschemas with their respective qualities, positions, etc.
    :param int schema_s: The id for the schema.
    :param List[int] orig_subschemas: The list of ids for the schema's
        original subschemas.
    :param int orig_no_subschemas: The number of the schema's original
        subschemas.
    :param List[Tuple[int, int]] orig_qualities: The list of subschema
        ids and quality ids for each of the schema's original qualities.
    :param List[int] updated_subschemas: The list of ids for the
        schema's updated subschemas.
    :param int updated_no_subschemas: The number of the schema's updated
        subschemas.
    :param List[Tuple[int, int]] updated_qualities: The list of
        subschema ids and quality ids for each of the schema's updated
        qualities.
    :return: None
    """
    solutions = conn.execute(
        """
        SELECT entry, solutions FROM entries
        WHERE schema = ?;
        """, (schema_s,)
    ).fetchall()

    # Iterates over every solution in the database.
    for entry_s, solution_j in solutions:
        # Finds the dictionary for the answers.
        solution = json.loads(solution_j)

        # If a subschema has been removed:
        if orig_no_subschemas == 2 and updated_no_subschemas == 1:
            # Finds the earliest positioned quality for the removed
            # subschema.
            remove_subschema = next(iter(
                set(orig_subschemas) - set(updated_subschemas)
            ))
            for subschema, collapse_quality in orig_qualities:
                if subschema == remove_subschema:
                    break
            else:
                raise ValueError(
                    f"Subschema {remove_subschema} existed without any "
                    "qualities."
                )

            # Turns rows into columns, removing original columns.
            if str(collapse_quality) in solution:
                solution = solution[str(collapse_quality)]

            # Removes original rows.
            else:
                for column in solution:
                    solution[column] = solution[column][str(collapse_quality)]

        # If a subschema has been added:
        elif orig_no_subschemas == 1 and updated_no_subschemas == 2:
            # Attempts to find a quality to retain the present answers.
            found = None
            for subschema in structure.values():
                (s_name, (_subschema_s, qualities)), *_ = subschema.items()
                for q_name, *quality in qualities:
                    if quality and int(quality[0]) == -1:
                        found = s_name, q_name

            # Empties the solutions if no such quality exists:
            if not found:
                solution = {}

            # Updates the answers.
            else:
                # Finds the quality to use for expansion.
                quality_s, = conn.execute(
                    """
                    SELECT quality FROM schemas
                    INNER JOIN subschemas
                        ON schemas.schema = subschemas.schema
                    INNER JOIN qualities
                        ON subschemas.subschema = qualities.subschema
                    WHERE schemas.schema = ?
                        AND subschemas.name = ?
                        AND qualities.name = ?;
                    """, (schema_s, *found)
                ).fetchone()

                # If rows are being added without altering the columns:
                if orig_subschemas[0] == updated_subschemas[0]:
                    # Modifies the answer appropriately.
                    for quality_c in solution.copy():
                        solution[quality_c] = {
                            str(quality_s): solution[quality_c]
                        }

                # If new columns are put in place, moving the original
                # columns to the rows:
                else:
                    # Modifies the answer appropriately.
                    solution = {str(quality_s): solution}

        # If the subschemas have been swapped, the answer should be
        # inverted.
        elif (
            orig_no_subschemas == 2
            and updated_no_subschemas == 2
            and orig_subschemas[0] != updated_subschemas[0]
        ):
            # Switches the columns and rows.
            new_solution = {}
            for old_column in solution:
                for old_row in solution[old_column]:
                    old_solution = solution[old_column][old_row]
                    if old_row not in new_solution:
                        new_solution[old_row] = {}
                    new_solution[old_row][old_column] = old_solution
            solution = new_solution

        # Removes all answers pertaining to removed qualities.
        for quality_c in solution.copy():
            if int(quality_c) not in map(lambda x: x[1], updated_qualities):
                solution.pop(quality_c)
                continue
            elif isinstance(solution[quality_c], dict):
                for quality_r in solution[quality_c].copy():
                    if int(quality_r) not in map(
                            lambda x: x[1], updated_qualities
                    ):
                        solution[quality_c].pop(quality_r)

        # Modifies the solution appropriately.
        conn.execute(
            """
            UPDATE entries
                SET solutions = ?
            WHERE entry = ?;
            """, (json.dumps(solution), entry_s)
        )
