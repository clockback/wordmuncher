# Builtins
import os
from pathlib import Path
import unittest

# Installed packages
import selenium.webdriver as wd
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException


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
        # Opens the browser.
        self.get(f"http://0.0.0.0:8080{location}")

        # Waits until the page has loaded.
        try:
            WebDriverWait(self, 10).until(ec.presence_of_all_elements_located((
                By.ID, check_id
            )))

        # Raises an error if it does not load.
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
        self.driver: FirefoxDriver = FirefoxDriver()

    def tearDown(self) -> None:
        """Tidies up the test once complete.
        :return: None
        """
        self.driver.close()

    @classmethod
    def tearDownClass(cls) -> None:
        """Cleans up once the tests are done.
        :return: None
        """
        os.remove(Path("/tmp", "test.db"))

