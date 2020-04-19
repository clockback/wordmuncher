# Builtins
import os
import unittest
from time import sleep

# Installed packages
import selenium.webdriver as wd
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

# Local imports
from prokart.src.application import app


class FirefoxDriver(wd.Firefox):
    def go_to(
            self, location: str, check_id: str = "sidebar-left-home"
    ) -> None:
        """Goes to the provided location in Prokart
        :param str location: The location starting with '/'.
        :param str check_id: The id of the element which indicates that
            the page has finished loading.
        :return: None
        """
        self.get(f"http://0.0.0.0:8080{location}")
        try:
            WebDriverWait(self, 10).until(ec.presence_of_all_elements_located((
                By.ID, check_id
            )))
        except TimeoutException:
            raise TimeoutError("Page did not load.")


class BasicTests(unittest.TestCase):
    """The class which implements all tests, including functionality for
    preparing before a test as well as after.
    """
    def setUp(self) -> None:
        """Prepares the test.
        :return: None
        """
        # Lets the application know that it is in testing mode.
        app.testing = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['DEBUG'] = False
        self.assertEqual(app.debug, False)
        self.driver: FirefoxDriver = FirefoxDriver()

    def tearDown(self) -> None:
        """Tidies up the test once complete.
        :return: None
        """
        self.driver.close()

    def test_check_menu(self) -> None:
        """Checks that the menu loads.
        :return: None
        """
        self.driver.go_to('/')
        sidebar = self.driver.find_element_by_css_selector(
            '.sidebar-center>button'
        )
        self.assertEqual(sidebar.text, "🇬🇪 → 🇬🇧")


# Runs the unit tests.
if __name__ == '__main__':
    unittest.main()
