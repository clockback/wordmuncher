__all__ = ["TestCreate", "TestLanguages", "TestSchema"]


# Builtins
import unittest

# Local imports
from prokart.unit_tests.tests.test_create import TestCreate
from prokart.unit_tests.tests.test_languages import TestLanguages
from prokart.unit_tests.tests.test_schema import TestSchema

if __name__ == '__main__':
    # Runs the unit tests.
    unittest.main(warnings="ignore")
