# Builtins
import os
from pathlib import Path
import shutil
from time import sleep
from typing import Dict, List
import unittest

# Installed packages
import selenium.webdriver as wd
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.firefox.webelement import FirefoxWebElement
from selenium.common.exceptions import TimeoutException, JavascriptException


class BasicTests(unittest.TestCase):
    """The class which implements all tests, including functionality for
    preparing before a test as well as after.
    """
    # Type hints the driver.
    driver: wd.Firefox

    def setUp(self) -> None:
        """Prepares the test.
        :return: None
        """
        self.driver = wd.Firefox()

    @classmethod
    def setUpClass(cls) -> None:
        """Prepares all the tests.
        :return:
        """
        # Copies the test database to the temporary folder.
        from_path = Path(os.path.dirname(__file__), "test.db")
        to_path = Path("/tmp", "test.db")
        shutil.copyfile(from_path, to_path)

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

    def allot_additional_answers(self, answers: List[str]) -> None:
        """Makes sure that the answers in the additional answers table.
        :param List[str] answers: The list of answers to be in the
            table.
        :return: None
        """
        # Finds the two possible dialog boxes which might be affected.
        add_entry_table = self.driver.find_element_by_id(
            "add-entry-container-background"
        )
        edit_entry_table = self.driver.find_element_by_id(
            "edit-entry-container-background"
        )

        # Finds out which of the dialog boxes is visible.
        add_visible = add_entry_table.is_displayed()
        edit_visible = edit_entry_table.is_displayed()

        # Ensures that one and only one dialog box is visible.
        self.assertIsNot(
            add_visible, edit_visible,
            "One and only one dialog box should be open."
        )

        # Finds which table to modify based upon what is visible.
        spec = "new" if add_visible else "edit"

        # Finds the table for the additional answers.
        table = self.driver.find_element_by_id(f"{spec}-entry-answers-table")

        # Finds the different extant answers.
        table_rows = table.find_elements_by_css_selector("tr:not(:last-child)")

        # Iterates over each extant table row.
        for row in table_rows:
            # Finds the two cells in the row.
            additional_answer, delete = row.find_elements_by_tag_name("td")

            # If the additional answer is not supposed to be there, uses
            # the delete button in the row to remove it.
            if additional_answer.text not in answers:
                delete.find_element_by_tag_name("button").click()

            # If the additional answer was requested as an argument,
            # Does not edit the answer later on.
            else:
                answers.remove(additional_answer.text)

        # Stops if there are no answers to add.
        if not answers:
            return

        # Adds each of the answers.
        for answer in answers:
            # Types in the answer to be added.
            self.type_entry_id(f"{spec}-entry-add-answer", answer)

            # Clicks on the arrow to add the answer.
            self.driver.find_element_by_css_selector(
                "#new-entry-add-answer-button>button"
            ).click()

    def check_button_enabled(self, button_id: str) -> None:
        """Ensures that a button with a given id is enabled.
        :param str button_id: The id of the button.
        :return: None
        """
        # Finds the button.
        button = self.driver.find_element_by_id(button_id)

        # Ensures that the button appears enabled.
        self.assertNotIn(
            "button-disabled", button.get_attribute("class"),
            f"Button #{button_id} is disabled."
        )

        # Attempts to obtain the string for the bound event.
        try:
            self.driver.execute_script(
                f"document.getElementById('{button_id}').onclick.toString();"
            )

        # If no string can be obtained, there the button is not bound to
        # an event, and should raise an error.
        except JavascriptException:
            raise ValueError(f"Button #{button_id} has no click event.")

    def check_button_disabled(self, button_id: str) -> None:
        """Ensures that a button with a given id is disabled.
        :param str button_id: The id of the button.
        :return: None
        """
        # Finds the button.
        button = self.driver.find_element_by_id(button_id)

        # Ensures that the button appears disabled.
        self.assertIn(
            "button-disabled", button.get_attribute("class"),
            f"Button #{button_id} is enabled."
        )

        # Attempts to obtain the string for the bound event.
        try:
            self.driver.execute_script(
                f"document.getElementById('{button_id}').onclick.toString();"
            )
            raise Exception("Button is bound to an event.")

        # If no string can be obtained, there the button is not bound to
        # an event, and should raise an error.
        except JavascriptException:
            return

    def check_no_row(self, table_id: str, column: str, value: str) -> None:
        """Ensures that a row with the provided cell does not exist in a
        table.
        :param str table_id: The id of the table.
        :param str column: The string for the column being checked.
        :param str value: The value which must not be in the column.
        :return: None
        """
        # Finds the table with the expected id.
        table = self.driver.find_element_by_id(table_id)

        # Finds the constituent parts of the table.
        columns, main_rows, *_ = table.find_elements_by_tag_name("tbody")

        # Finds the column values for each value.
        for i, column_i in enumerate(
                columns.find_elements_by_tag_name("th"), 1
        ):
            if column_i.text == column:
                found_i = i
                break

        # If one is not found, raises an appropriate error.
        else:
            raise ValueError(
                f"Table #{table_id} has no column '{column}'."
            )

        # Iterates over each rows' cell for the appropriate column.
        for td in main_rows.find_elements_by_css_selector(
                f"td:nth-child({found_i})"
        ):
            # Raises an error if the value is found.
            if td.text == value:
                raise ValueError(
                    f"Found '{column}' value '{value}' expected "
                    "not to be there."
                )

    def check_row(self, table_id: str, cells: Dict[str, str]) -> None:
        """Ensures that a row with the provided cells exist in a table.
        :param str table_id: The id of the table.
        :param Dict[str, str] cells: A dictionary where each key
            corresponds to a column name and the value corresponds to
            its value.
        :return: None
        """
        # Finds the table with the expected id.
        table = self.driver.find_element_by_id(table_id)

        # Finds the constituent parts of the table.
        columns, main_rows, *_ = table.find_elements_by_tag_name("tbody")

        # Prepares to construct a dictionary mapping indices to values.
        cells_i = {}

        # Finds the column values for each value.
        for i, column in enumerate(columns.find_elements_by_tag_name("th")):
            if column.text in cells:
                cells_i[i] = str(cells[column.text])

        # Asserts that the dictionaries are the same length.
        self.assertEqual(
            len(cells_i), len(cells),
            f"Did not find find all columns from {list(cells.keys())}."
        )

        # Iterates over each of the rows.
        for row in main_rows.find_elements_by_tag_name("tr"):
            # Finds all of the cells in the rows.
            row_cells = row.find_elements_by_tag_name("td")

            # Iterates over all the cells to be inspected.
            for i, check_cell in cells_i.items():
                # Only stops iterating if a mismatch occurs.
                if check_cell != row_cells[i].text:
                    break

            # If no mismatch occurred, stops looking.
            else:
                return

        raise ValueError(f"No rows match combination: {cells}")

    def check_visibility(self, element_id: str, visible: bool = True) -> None:
        """Checks that an element is visible.
        :param str element_id: The id of the element to check.
        :param bool visible: Whether or not it should be visible.
        :return: None
        """
        # Finds the element.
        element = self.driver.find_element_by_id(element_id)

        # Finds the visibility of the element.
        e_visible = element.is_displayed()

        # Makes sure the element is (or is not) visible as requested.
        self.assertIs(
            visible, e_visible, f"Element #{element_id} is supposed to be "
            f"{'' if visible else 'in'}visible."
        )

    def click_button_id(self, query: str) -> None:
        """Clicks on a button.
        :param str query: The id of the button.
        :return: None
        """
        # Finds the button.
        button = self.driver.find_element_by_id(query)

        # Verifies that it is indeed a button.
        self.assertEqual(
            button.tag_name, "button", f"Element #{query} is not a button."
        )

        # Verifies that the button is not disabled.
        self.assertNotIn(
            "button-disabled", button.get_attribute("class"),
            f"Button #{query} is disabled."
        )

        # Attempts to obtain the string for the bound event.
        try:
            self.driver.execute_script(
                f"document.getElementById('{query}').onclick.toString();"
            )

        # If no string can be obtained, there the button is not bound to
        # an event, and should raise an error.
        except JavascriptException:
            raise ValueError(f"Button #{query} has no click event.")

        # Clicks the button.
        self.driver.execute_script(
            "arguments[0].scrollIntoView({block: 'end', inline:"
            "'nearest', behavior: 'smooth'});", button
        )

        # Waits for scrolling to complete.
        sleep(0.5)

        # Clicks on the button.
        button.click()

    def click_home_button(self) -> None:
        """Clicks on the home button and waits until the home page
        loads.
        :return: None
        """
        # Clicks on the button.
        self.driver.find_element_by_id("sidebar-left-home").click()

    def deselect_all_rows(self, table_id: str) -> None:
        """Deselects all rows already selected.
        :param str table_id: The id of the table.
        :return: None
        """
        # Finds the table with the expected id.
        rows = self.driver.find_elements_by_css_selector(
            f"#{table_id}>tbody:nth-child(2)>tr"
        )

        # Iterates over each of the rows.
        for row in rows:
            row: FirefoxWebElement
            if "selected" in row.get_attribute("class"):
                # Scrolls to the row.
                self.driver.execute_script(
                    "arguments[0].scrollIntoView({block: 'center', inline:"
                    "'nearest', behavior: 'smooth'});", row
                )

                # Waits for scrolling to complete.
                sleep(0.5)

                # Clicks on the row.
                row.find_element_by_tag_name("td").click()

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
        self.driver.get(f"http://0.0.0.0:8080{location}")

        # Waits until the page has loaded.
        try:
            WebDriverWait(self.driver, 10).until(
                ec.presence_of_element_located((By.ID, check_id))
            )

        # Raises an error if it does not load.
        except TimeoutException:
            raise TimeoutError("Page did not load.")

    def load_all_rows(self, table_id: str) -> None:
        """Loads all rows in the table.
        :param str table_id: The id of the table.
        :return: None
        """
        # Finds the table with the expected id.
        load_row = self.driver.find_element_by_css_selector(
            f"#{table_id}>tbody:last-child>tr"
        )

        # Keeps clicking on the "Load more..." td until all rows have
        # appeared.
        while "visibility: collapse" not in load_row.get_attribute("style"):
            # Scrolls down to view the bottom of the table.
            self.driver.execute_script(
                "arguments[0].scrollIntoView({block: 'end', inline:"
                "'nearest', behavior: 'smooth'});", load_row
            )

            # Allows scrolling to complete
            sleep(0.5)

            # Clicks on the row.
            self.driver.execute_script(
                "arguments[0].click();", load_row
            )

            # Allows browser to register change.
            sleep(0.05)

    def toggle_row(self, table_id: str, column_name: str, value: str) -> None:
        """Toggles the row in a table given its column value
        corresponds to a particular value.
        :param str table_id: The id of the table.
        :param str column_name: The string value of the column to
            search.
        :param str value: The string value of the row to be selected.
        :return: None
        """
        self.toggle_rows(table_id, column_name, [value])

    def toggle_rows(
            self, table_id: str, column_name: str, values: List[str]
    ) -> None:
        """Toggles the rows in a table given its column value
        corresponds to particular values.
        :param str table_id: The id of the table.
        :param str column_name: The string value of the column to
            search.
        :param List[str] values: The string value of the row to be
            selected.
        :return: None
        """
        # Finds the table with the expected id.
        table = self.driver.find_element_by_id(table_id)

        # Finds the constituent parts of the table
        columns, main_rows, *_ = table.find_elements_by_tag_name("tbody")

        # Finds the column value.
        for i, column in enumerate(columns.find_elements_by_tag_name("th"), 1):
            if column.text == column_name:
                found_i = i
                break

        # If one is not found, raises an appropriate error.
        else:
            raise ValueError(
                f"Table #{table_id} has no column '{column_name}'."
            )

        # Iterates over every value.
        for value in values:
            # Searches each row in the table's main body.
            for td in main_rows.find_elements_by_css_selector(
                f"td:nth-child({found_i})"
            ):
                # If the row with the matching value for the correct
                # column is found, clicks on the row cell.
                if td.text == value:
                    td.click()
                    break

            # If one is not found, raises an appropriate error.
            else:
                raise ValueError(
                    f"No rows in table #{table_id} have column '{column_name}'"
                    f" value '{value}'."
                )

    def type_entry_id(self, query: str, text: str) -> None:
        """Finds an element by its id, then types something as though it
        were being done by a user.
        :param str query: The id of the element which receiving the
            typing.
        :param str text: The string to be typed.
        :return: None
        """
        # Finds the entry.
        entry = self.driver.find_element_by_id(query)

        # Clears everything in the entry.
        if entry.get_attribute("value"):
            (
                ActionChains(self.driver).click(entry).key_down(Keys.CONTROL)
                .key_down("a").key_up("a").key_up(Keys.CONTROL)
                .send_keys(Keys.BACKSPACE).perform()
            )

        # Types into the entry.
        self.type_str(entry, text)

    @staticmethod
    def type_str(element: FirefoxWebElement, text: str) -> None:
        """Types something as though it were being done by a user.
        :param FirefoxWebElement element: The element which is receiving
            the typing.
        :param str text: The string to be typed.
        :return: None
        """
        # Clicks on the element.
        element.click()

        # Iterates over each character.
        for char in text:
            # Sends a key press event to the element.
            element.send_keys(char)

            # Waits before all but the first typed character.
            sleep(0.03)
