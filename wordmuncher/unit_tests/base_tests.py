# Builtins
import os
from pathlib import Path
import shutil
from time import sleep
from typing import Callable, Dict, List, Tuple, Union
import unittest

# Installed packages
import selenium.webdriver as wd
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.firefox.webelement import FirefoxWebElement
from selenium.common.exceptions import (
    JavascriptException, StaleElementReferenceException, TimeoutException
)


class BasicTests(unittest.TestCase):
    """The class which implements all tests, including functionality for
    preparing before a test as well as after.
    """
    # Type hints the driver.
    driver: wd.Firefox

    # Contains all stored elements.
    storage: Dict[str, FirefoxWebElement] = {}

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
        self.driver.quit()

    @classmethod
    def tearDownClass(cls) -> None:
        """Cleans up once the tests are done.
        :return: None
        """
        os.remove(Path("/tmp", "test.db"))

    @property
    def get_id(self) -> Callable[[str], FirefoxWebElement]:
        """Returns the driver's method for finding elements by their id.
        :return: The method for finding elements by their id.
        :rtype: Callable[[str], FirefoxWebElement]
        """
        return self.driver.find_element_by_id

    def _get_answer_row(self, answer: str, spec: str) -> FirefoxWebElement:
        """Returns the element for the row with the required answer.
        :param str answer: The answer to be found.
        :param str spec: Either 'new' or 'edit' depending on which
            dialog box is open.
        :return: FirefoxWebElement
        """
        # Finds the answers table.
        rows = self.driver.find_elements_by_css_selector(
            f"#{spec}-entry-answers-table tr"
        )

        # Finds the row with the required answer.
        for row in rows:
            if row.find_element_by_tag_name("td").text == answer:
                return row

        # Raises an error if the answer was not in the table.
        else:
            raise ValueError(f"Cannot find answer '{answer}' in table.")

    def _get_entry_dialog_status(self) -> str:
        """Finds out which entry dialog box is open.
        :return: Either 'new' or 'edit'.
        :rtype: str
        """
        # Finds the two possible dialog boxes which might be affected.
        add_entry_table = self.get_id("new-entry-container-background")
        edit_entry_table = self.get_id("edit-entry-container-background")

        # Finds out which of the dialog boxes is visible.
        add_visible = add_entry_table.is_displayed()
        edit_visible = edit_entry_table.is_displayed()

        # Ensures that one and only one dialog box is visible.
        self.assertIsNot(
            add_visible, edit_visible,
            "One and only one dialog box should be open."
        )

        # Finds which table to modify based upon what is visible.
        return "new" if add_visible else "edit"

    def add_quality(self, subschema: str, quality: str) -> None:
        """Adds a quality to the subschema.
        :param str subschema: Either "columns" or "rows".
        :param str quality: The quality to be added.
        :return: None
        """
        # Finds the subschema table containing the quality.
        table = self.get_id(f"{subschema}-subschema")

        # Adds a new quality.
        add_btn_cell = table.find_element_by_css_selector("td:last-child")
        add_btn = table.find_element_by_class_name("quality-add")
        (
            ActionChains(self.driver).move_to_element(add_btn_cell)
            .click(add_btn).perform()
        )

        # Selects the cell for the new quality.
        table.find_element_by_css_selector(
            "td:nth-last-child(2)>.quality-name"
        ).click()

        # Fills the name of the quality.
        quality_input = table.find_element_by_tag_name("input")
        self.type_str(quality_input, quality)

    def allot_additional_answers(self, answers: List[str]) -> None:
        """Makes sure that the answers in the additional answers table.
        :param List[str] answers: The list of answers to be in the
            table.
        :return: None
        """
        # Finds which table to modify based upon what is visible.
        spec = self._get_entry_dialog_status()

        # Finds the table for the additional answers.
        table = self.get_id(f"{spec}-entry-answers-table")

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
                f"#{spec}-entry-add-answer-button>span"
            ).click()

    def check_button_enabled(self, button_id: str) -> None:
        """Ensures that a button with a given id is enabled.
        :param str button_id: The id of the button.
        :return: None
        """
        # Finds the button.
        button = self.get_id(button_id)

        # Ensures that the button appears enabled.
        self.assertNotIn(
            "button-disabled", button.get_attribute("class"),
            f"Button #{button_id} is disabled."
        )

        # Attempts to obtain the string for the bound event.
        try:
            self.driver.execute_script(
                "arguments[0].onclick.toString();", button
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
        button = self.get_id(button_id)

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
            raise ValueError("Button is bound to an event.")

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
        table = self.get_id(table_id)

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
        table = self.get_id(table_id)

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

    def check_select_has_option(
            self, select: str, text: str, find: bool = True
    ) -> None:
        """Checks that a select element contains a certain string as an
        option (or not).
        :param str select: The id of the select element.
        :param str text: The option for which to check.
        :param bool find: Whether or not the option is expected to be
            present (True) or absent (False).
        :return: None
        """
        # Finds the select element's option containing the string.
        try:
            self.driver.find_element_by_xpath(
                f"//*[@id='{select}']//option[contains(text(),'{text}')]"
            )

            if not find:
                raise ValueError(
                    f"The select '{select}' contains option with '{text}'."
                )

        # Raises an exception if no such element exists.
        except ec.NoSuchElementException:
            if find:
                raise ValueError(
                    f"No select '{select}' contains option with '{text}'."
                )

    def check_translator(self, l_from: str, l_to: str) -> None:
        """Checks that the specified translator is in use.
        :param str l_from: The flag for the language being translated.
        :param str l_to: The flag for the language to which translations
            are being made.
        :return: None
        """
        self.assertEqual(
            self.get_id("sidebar-center-translator").text, f"{l_from} → {l_to}"
        )

    def check_visibility(self, element_id: str, visible: bool = True) -> None:
        """Checks that an element is visible.
        :param str element_id: The id of the element to check.
        :param bool visible: Whether or not it should be visible.
        :return: None
        """
        # Finds the element.
        element = self.get_id(element_id)

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
        button = self.get_id(query)

        # Verifies that it is indeed a button.
        self.assertEqual(
            button.tag_name, "span", f"Element #{query} is not a button."
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
        self.get_id("sidebar-left-home").click()

    def configure_schema(
            self, subschema: Union[str, Tuple[str, str]],
            qualities: Union[List[str], Tuple[List[str], List[str]]]
    ) -> None:
        """Uses the provided subschema and qualities to generate a
        schema.
        :param Union[str, Tuple[str, str]] subschema: Either one or two
            subschema names.
        :param Union[List[str], Tuple[List[str], List[str]]] qualities:
            Either a list of qualities in order for a single subschema
            or two lists for two subschemas.
        :return: None
        """
        # Finds the button to add or remove rows.
        add_remove_btn = self.get_id("add-remove-rows-subschema")

        # Standardizes the format of the subschemas and qualities.
        if isinstance(subschema, str):
            self.configure_subschema(subschema, qualities, "columns")
            if add_remove_btn.text == "Remove rows":
                add_remove_btn.click()
        else:
            qualities: Tuple[List[str], List[str]]
            self.configure_subschema(subschema[0], qualities[0], "columns")
            if add_remove_btn.text == "Add rows":
                add_remove_btn.click()

            self.configure_subschema(subschema[1], qualities[1], "rows")

    def configure_subschema(
            self, subschema: str, qualities: List[str], rows_or_columns: str
    ) -> None:
        """Uses the interface to design an individual subschema.
        :param str subschema: The updated name of the subschema.
        :param List[str] qualities: The list of qualities assigned to
            the subschema.
        :param str rows_or_columns: Either "rows" or "columns".
        :return: None
        """
        # Finds the column title span.
        columns_title = self.driver.find_element_by_css_selector(
            f"#{rows_or_columns}-subschema th>span"
        )

        # Updates the column title.
        if columns_title.text != subschema:
            columns_title.click()
            columns_title_input = self.driver.find_element_by_css_selector(
                f"#{rows_or_columns}-subschema input"
            )
            self.type_str(columns_title_input, subschema)

        # Finds all the qualities associated with the first subschema.
        quality_removes = self.driver.find_elements_by_css_selector(
            f"#{rows_or_columns}-subschema .quality-remove"
        )

        # Adds column qualities for all those missing.
        if len(quality_removes) < len(qualities):
            no_add = len(qualities) - len(quality_removes)
            add_quality = self.driver.find_element_by_css_selector(
                f"#{rows_or_columns}-subschema .quality-add"
            )
            for _repeat in range(no_add):
                (
                    ActionChains(self.driver).move_to_element(add_quality)
                    .click(add_quality).perform()
                )
                sleep(0.03)

        # Removes all column qualities of which there are too many.
        elif len(quality_removes) > len(qualities):
            no_remove = len(quality_removes) - len(qualities)
            for quality_remove in quality_removes[
                :len(quality_removes) - no_remove - 1:-1
            ]:
                (
                    ActionChains(self.driver).move_to_element(quality_remove)
                    .click(quality_remove).perform()
                )
                sleep(0.03)

        # Refreshes all the qualities associated with the first subschema.
        quality_spans = self.driver.find_elements_by_css_selector(
            f"#{rows_or_columns}-subschema .quality-name"
        )

        first = True
        for quality_span, quality_name in zip(quality_spans, qualities):
            if quality_span.text != quality_name:
                quality_span.click()

                # Treats the first attempt to select the cell as just a
                # deselection of the previous cell.
                if not first:
                    quality_span.click()

                quality_input = self.driver.find_element_by_css_selector(
                    f"#{rows_or_columns}-subschema input"
                )
                self.type_str(quality_input, quality_name)

                first = False

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
                    "arguments[0].scrollIntoView({block: 'end', inline:"
                    "'nearest', behavior: 'smooth'});",
                    row.find_element_by_tag_name("td")
                )

                # Waits for scrolling to complete.
                sleep(0.5)

                # Clicks on the row.
                row.find_element_by_tag_name("td").click()

    def go_to(
            self, location: str, check_id: str = "sidebar-left-home"
    ) -> None:
        """Goes to the provided location in Word Muncher
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

    def pick_flag(self, flag_name: str) -> None:
        """Selects a flag with the specified name and ensures that it
        is removed from the list of flags.
        :param str flag_name: The name of the country or region with the
            flag.
        :return: None
        """
        # Clicks on the button to display the flags.
        self.click_button_id("choose-flag")

        # Finds the flags that have been revealed.
        flags = self.driver.find_elements_by_xpath(
            f"//*[@id = 'hidden-flags']/div[./span[text() = '{flag_name}']]"
        )

        # Iterates over the flags to find the one with the right name.
        for flag in flags:
            if flag.find_element_by_tag_name("span").get_attribute(
                    "innerHTML"
            ) == flag_name:
                found_flag = flag
                break

        # If the flag was not found, raises an error.
        else:
            raise ValueError(f"Flag with name {flag_name} not found.")

        # Finds the text representation of the flag.
        flag_str = found_flag.find_element_by_tag_name("button").text

        # Clicks on the flag.
        found_flag.click()

        # Checks that the flag in the button is the right flag.
        self.assertEqual(
            flag_str, self.get_id("choose-flag").text,
            f"Flag {flag_str} did not appear in the button as needed."
        )

        # Checks that the flag has been removed from the table of flags.
        self.assertIn(
            "display: none;", found_flag.find_element_by_tag_name(
                "button"
            ).get_attribute("style"), "Flag was not removed from table."
        )

    def populate_schema_create(
            self, answers: Union[Dict[str, str], Dict[Tuple[str, str], str]],
            context: str
    ) -> None:
        """Populates the required answers for a schema.
        :param Union[Dict[str, str], Dict[Tuple[str, str], str]] answers:
            A mapping between the schema qualities and the answers.
        :param str context: Either "new" or "edit" regarding the entry.
        :return: None
        """
        # Finds the table for the schema's answers.
        table = self.get_id(f"{context}-entry-answer-schema-table")

        # Find the column quality names.
        column_qualities = [
            th.text for th in table.find_elements_by_css_selector(
                f"#{context}-entry-answer-schema-columns>th"
            )
        ]

        # Find the row quality names.
        row_qualities = [
            th.text for th in table.find_elements_by_css_selector(
                "tr:nth-child(3)>th:nth-child(2),tr:nth-child(1n+4)>th"
            )
        ]

        # Establishes whether or not multiple rows are used.
        use_rows = len(row_qualities) > 0

        # Finds the cells.
        all_cells = table.find_elements_by_css_selector(
            "tr:nth-child(1n+3)>td"
        )

        # Groups the different cells by row.
        if use_rows:
            grouped_cells = [
                all_cells[i:i + len(column_qualities)]
                for i in range(0, len(all_cells), len(column_qualities))
            ]
        else:
            grouped_cells = all_cells

        # Iterates over each of the answers to be populated.
        first_answer = True
        for qualities, answer in answers.items():
            # Finds which cell is to be modified for the answer.
            if use_rows:
                column = column_qualities.index(qualities[0])
                row = row_qualities.index(qualities[1])
                cell = grouped_cells[row][column]
            else:
                column = column_qualities.index(qualities)
                cell = grouped_cells[column]

            # Opens the input for the table cell.
            cell.click()
            if not first_answer:
                sleep(0.03)
                cell.click()
            else:
                first_answer = False

            # Fills in the answer for the table cell.
            answer_input = cell.find_element_by_tag_name("input")
            self.type_str(answer_input, answer)

    def remember_element(self, element: str) -> None:
        """Stores the name of an element for future reference.
        :param str element: The id of the element to be stored.
        :return: None
        """
        self.storage[element] = self.get_id(element)

    def remove_answer(self, answer: str) -> None:
        """Removes the answer from the answers table.
        :param str answer: The answer to be removed.
        :return: None
        """
        # Finds which table to modify based upon what is visible.
        spec = self._get_entry_dialog_status()

        # Finds the answers table.
        row = self._get_answer_row(answer, spec)

        # Clicks on the delete button for the row.
        row.find_element_by_tag_name("button").click()

        # Ensures that the row was successfully deleted.
        try:
            self.assertIsNone(
                row.get_attribute("innerHTML"),
                "Row should have been deleted but was not."
            )
        except StaleElementReferenceException:
            pass

    def remove_quality(self, subschema: str, quality: str) -> None:
        """Removes the quality from the subschema.
        :param str subschema: Either "columns" or "rows".
        :param str quality: The quality to be removed.
        :return: None
        """
        # Finds the subschema table containing the quality.
        table = self.get_id(f"{subschema}-subschema")

        # Finds the qualities associated with the subschema.
        quality_cells = table.find_elements_by_tag_name("td")

        # Iterates over each of the quality cells.
        for quality_cell in quality_cells:
            # Finds the text for the cell.
            cell_span = quality_cell.find_element_by_class_name("quality-name")

            # If quality is found, removes it.
            if cell_span.text == quality:
                btn = quality_cell.find_element_by_class_name("quality-remove")
                (
                    ActionChains(self.driver).move_to_element(cell_span)
                    .click(btn).perform()
                )
                break

        # If no corresponding cell was found, raises an error.
        else:
            raise ValueError(f"Quality {quality} not found.")

    def select_option(self, select: str, text: str) -> None:
        """Uses a select element to select something.
        :param str select: The id of the select element.
        :param str text: The option to select.
        :return: None
        """
        # Finds the select element to click.
        element = self.get_id(select)

        # Clicks on the drop down.
        element.click()

        # Finds the select element's option containing the string.
        try:
            option = element.find_element_by_xpath(
                f".//*[@class='select-items']/*[contains(text(),'{text}')]"
            )

        # Raises an exception if no such element exists.
        except ec.NoSuchElementException:
            raise ValueError(
                f"No select '{select}' contains option with '{text}'."
            )

        # Clicks on the option.
        option.click()

    def swap_answer(self, answer: str) -> None:
        """Clicks on the answer row specified, such that the selected
        answer is promoted while the main answer, if it exists, is
        demoted down to the table.
        :param str answer: The answer to be promoted.
        :return: None
        """
        # Finds which table to modify based upon what is visible.
        spec = self._get_entry_dialog_status()

        # Finds the answer entry.
        answer_entry = self.get_id(f"{spec}-entry-answer")

        # Finds the text currently assigned to the primary answer.
        before_primary = answer_entry.get_attribute("value")

        # Finds the answers table.
        row = self._get_answer_row(answer, spec)

        # Clicks on the row to make is swap.
        row.find_element_by_tag_name("td").click()

        # Checks that the new promoted answer is correct.
        self.assertEqual(
            answer_entry.get_attribute("value"), answer,
            f"Answer '{answer}' was not successfully promoted."
        )

        # If the row should be deleted, checks this happened
        # successfully.
        if not before_primary:
            try:
                self.assertIsNone(
                    row.get_attribute("innerHTML"),
                    "Row should have been deleted but was not."
                )
            except StaleElementReferenceException:
                pass

        # Otherwise, checks that the row now contains the previous
        # primary answer.
        else:
            self.assertEqual(
                row.find_element_by_tag_name("td").text, before_primary,
                "Row should now contain previous primary answer "
                f"'{before_primary}'."
            )

    def swap_subschemas(self) -> None:
        """Clicks the button that swaps the subschema around.
        :return: None
        """
        self.get_id("swap-subschemas").click()

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
        table = self.get_id(table_id)

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
        entry = self.get_id(query)

        # Clears everything in the entry.
        if entry.get_attribute("value"):
            (
                ActionChains(self.driver).click(entry).key_down(Keys.CONTROL)
                .key_down("a").key_up("a").key_up(Keys.CONTROL)
                .send_keys(Keys.BACKSPACE).perform()
            )

        # Types into the entry.
        self.type_str(entry, text, clear=True)

    def type_str(
            self, element: FirefoxWebElement, text: str, *, clear: bool = True
    ) -> None:
        """Types something as though it were being done by a user.
        :param FirefoxWebElement element: The element which is receiving
            the typing.
        :param str text: The string to be typed.
        :param bool clear: Whether or not to clear the entry before
            typing.
        :return: None
        """
        # Clicks on the element.
        element.click()

        # Clears the entry of text.
        if clear:
            (
                ActionChains(self.driver).key_down(Keys.CONTROL).key_down("a")
                .key_up("a").key_up(Keys.CONTROL).send_keys(Keys.BACKSPACE)
                .perform()
            )

        # Iterates over each character.
        for char in text:
            # Sends a key press event to the element.
            element.send_keys(char)

            # Waits before all but the first typed character.
            sleep(0.03)

    def verify_schema_answers(
            self, answers: Union[Dict[str, str], Dict[Tuple[str, str], str]]
    ) -> None:
        """Ensures that an entry's answers have had the schema filled
        out as needed.
        :param Union[Dict[str, str], Dict[Tuple[str, str], str]] answers:
            Either "new" or "edit" regarding the entry.
        :return: None
        """
        # Finds the table for the schema's answers.
        table = self.get_id("edit-entry-answer-schema-table")

        # Find the column quality names.
        column_qualities = [
            th.text for th in table.find_elements_by_css_selector(
                "#edit-entry-answer-schema-columns>th"
            )
        ]

        # Find the row quality names.
        row_qualities = [
            th.text for th in table.find_elements_by_css_selector(
                "tr:nth-child(3)>th:nth-child(2),tr:nth-child(1n+4)>th"
            )
        ]

        # Establishes whether or not multiple rows are used.
        use_rows = len(row_qualities) > 0

        # Finds the cells.
        all_cells = table.find_elements_by_css_selector(
            "tr:nth-child(1n+3)>td"
        )

        # Groups the different cells by row.
        if use_rows:
            grouped_cells = [
                all_cells[i:i + len(column_qualities)]
                for i in range(0, len(all_cells), len(column_qualities))
            ]
        else:
            grouped_cells = all_cells

        # Iterates over each of the answers to be populated.
        for qualities, answer in answers.items():
            # Finds which cell is to be checked for the answer.
            if use_rows:
                column = column_qualities.index(qualities[0])
                row = row_qualities.index(qualities[1])
                cell = grouped_cells[row][column]
            else:
                column = column_qualities.index(qualities)
                cell = grouped_cells[column]

            # Opens the input for the table cell.
            if cell.text != answer:
                raise ValueError(
                    f"Table cell {(*qualities,)} should contain {answer}. Got "
                    f"{cell.text} instead."
                )

    def wait_until_gone(self, element: str) -> None:
        """Waits until the element with the provided id has disappeared.
        :param str element: The id of the remembered element to
            disappear.
        :return: None
        """
        # Finds the element.
        element = self.storage[element]

        # Waits until the element has disappeared.
        try:
            WebDriverWait(self.driver, 10).until(ec.staleness_of(element))

        # Raises an error if it does not load.
        except TimeoutException:
            raise TimeoutError(f"Element {element} did not disappear.")
