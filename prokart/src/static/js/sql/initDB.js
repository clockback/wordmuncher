import { getConnection } from './utils/connect.js';


function createFlagsTable(db) {
    let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS flags (
            flag INTEGER PRIMARY KEY AUTOINCREMENT,
            text CHAR(4) NOT NULL,
            country VARCHAR(40) NOT NULL,
            CONSTRAINT one_flag UNIQUE (text)
            CONSTRAINT country UNIQUE (country)
        )
    `);
    stmt.run();
    stmt.free();

    stmt = db.prepare(`
        SELECT 1 AS flagExists FROM flags
        LIMIT 1;
    `);
    stmt.step();
    let flagExists = stmt.getAsObject().flagExists;
    stmt.free();

    if (!flagExists) {
        stmt = db.prepare(`
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
        `);
        stmt.run();
        stmt.free();
    }

    stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS languages (
            language INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR (40) NOT NULL,
            flag INTEGER NOT NULL
                REFERENCES flags (flag)
                    ON DELETE CASCADE,
            CONSTRAINT one_name UNIQUE (name)
        );
    `);
    stmt.run();
    stmt.free();
}

function createTranslatorsTable(db) {
    let stmt = db.prepare(`
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
    `);
    stmt.run();
    stmt.free();
}

function createSheetsTable(db) {
    let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS sheets (
            sheet INTEGER PRIMARY KEY AUTOINCREMENT,
            translator INTEGER
                REFERENCES translators(translator)
                    ON DELETE CASCADE,
            name VARCHAR (80),
            CONSTRAINT name UNIQUE (translator, name)
        );
    `);
    stmt.run();
    stmt.free();
}

function createSchemasTable(db) {
    let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS schemas (
            schema INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(80) NOT NULL
        );
    `);
    stmt.run();
    stmt.free();
}

function createEntriesTable(db) {
    let stmt = db.prepare(`
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
    `);
    stmt.run();
    stmt.free();
}

function createMentionsTable(db) {
    let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS mentions (
            mention INTEGER PRIMARY KEY AUTOINCREMENT,
            sheet INTEGER REFERENCES sheets(sheet)
                ON DELETE CASCADE,
            entry INTEGER REFERENCES entries(entry)
                ON DELETE CASCADE,
            CONSTRAINT name UNIQUE (sheet, entry)
        );
    `);
    stmt.run();
    stmt.free();
}

function createSubschemasTable(db) {
    let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS subschemas (
            subschema INTEGER PRIMARY KEY AUTOINCREMENT,
            schema INTEGER REFERENCES schemas(schema)
                ON DELETE CASCADE,
            name VARCHAR(80) NOT NULL,
            pos INTEGER
        );
    `);
    stmt.run();
    stmt.free();
}

function createQualitiesTable(db) {
    let stmt = db.prepare(`
        CREATE TABLE IF NOT EXISTS qualities (
            quality INTEGER PRIMARY KEY AUTOINCREMENT,
            subschema INTEGER REFERENCES subschemas(subschema)
                ON DELETE CASCADE,
            name VARCHAR(80),
            pos INTEGER
        );
    `);
    stmt.run();
    stmt.free();
}

async function createAllTables() {
    let db = await getConnection();

    createFlagsTable(db);
    createTranslatorsTable(db);
    createSheetsTable(db);
    createSchemasTable(db);
    createEntriesTable(db);
    createMentionsTable(db);
    createSubschemasTable(db);
    createQualitiesTable(db);

    postMessage(true);
}

createAllTables();
