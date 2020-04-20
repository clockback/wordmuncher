__all__ = ["TestCreate"]


# Builtins
from pathlib import Path
import shutil
import unittest

# Local imports
from prokart.unit_tests.tests.test_create import TestCreate


if __name__ == '__main__':
    # Copies the test database to the temporary folder.
    from_path = Path("test.db")
    to_path = Path("/tmp", "test.db")
    shutil.copyfile(from_path, to_path)

    # Runs the unit tests.
    unittest.main()
