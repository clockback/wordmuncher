# Installed packages
from flask import Flask


# The application itself.
app: Flask = Flask(__name__)

# Settings
max_rows: int = 5
