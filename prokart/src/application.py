# Installed packages
from flask import Flask


# The application itself.
app: Flask = Flask(__name__)

#
app.debug = True

# Sets the maximum number of rows that can be loaded into a table at a
# time.
app.config["MAX_ROWS"] = 5

# Sets the path of the database.
app.config["PATH"] = ""

# Sets the name of the database. This is 'vocab.db' by default.
app.config["DATABASE"] = "vocab.db"
