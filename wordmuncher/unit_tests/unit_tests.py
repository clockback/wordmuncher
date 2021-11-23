__all__ = ["TestCreate", "TestLanguages", "TestSchema"]


# Builtins
import unittest

# Local imports
from wordmuncher.unit_tests.tests.test_create import TestCreate
from wordmuncher.unit_tests.tests.test_languages import TestLanguages
from wordmuncher.unit_tests.tests.test_schema import TestSchema

if __name__ == '__main__':
    # Runs the unit tests.
    unittest.main(warnings="ignore")
