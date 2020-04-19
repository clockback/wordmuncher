# Installed packages
from flask import Flask


# The application itself.
app: Flask = Flask(__name__)

# Sets the maximum number of rows that can be loaded into a table at a
# time.
app.config["MAX_ROWS"] = 5
