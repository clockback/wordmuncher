# Local imports
from prokart.unit_tests.base_tests import BasicTests


class TestCreate(BasicTests):
    """Contains all tests relating to the creation area. The creation
    area is where different vocabulary sheets and entries are created
    and edited.
    """
    def test_001_create_new_sheet(self) -> None:
        """Checks that a new entry can be created.
        :return: None
        """
        # Chooses to create a sheet with the name "A new sheet".
        name = "A new sheet"

        # We wish to add the following question to the sheet.
        question = "Entry without mention"

        # Opens the browser.
        self.go_to('/create')

        # Clicks the new sheet button.
        self.click_button_id("new-sheet")

        # Types in the name of the new sheet
        self.type_entry_id("new-sheet-name", name)

        # Searches for the desired entry.
        self.type_entry_id("new-sheet-search-entries", question)

        # Clicks on the desired entry.
        self.toggle_row("add-sheet-entries-table", "Question", question)

        # Saves the new sheet.
        self.click_button_id("save-new-sheet")

        # Searches for the newly made sheet.
        self.type_entry_id("search-all", name)

        # Verifies that the entry has been inserted into the table.
        self.check_row("sheets-table", {"Sheet": name, "# Entries": 1})

        # Searches for the affected entry.
        self.type_entry_id("search-all", question)

        # Verifies that the entry has been inserted into the table.
        self.check_row("entries-table", {
            "Question": question, "# Mentions": 1
        })

    def test_002_create_edit_sheet(self) -> None:
        """Checks that an entry can be edited.
        :return: None
        """
        # We wish to edit the following sheet.
        sheet_1 = "Sheet to edit"

        # We wish to change its name to the following.
        sheet_2 = "Sheet has been edited"

        # We wish to add the following entries' questions.
        questions = ["Give to edit sheet 1", "Give to edit sheet 2"]

        # Opens the browser.
        self.go_to('/create')

        # Searches for the affected sheet.
        self.type_entry_id("search-all", sheet_1)

        # Clicks on the desired sheet.
        self.toggle_row("sheets-table", "Sheet", sheet_1)

        # Clicks on the edit button.
        self.click_button_id("edit-sheet")

        # Changes the name of the sheet.
        self.type_entry_id("edit-sheet-name", sheet_2)

        # Loads all the rows in the entries table.
        self.load_all_rows("edit-sheet-entries-table")

        # Deselects all selected entries in the table.
        self.deselect_all_rows("edit-sheet-entries-table")

        # Selects entries for the sheet.
        self.toggle_rows("edit-sheet-entries-table", "Question", questions)

        # Saves the edited sheet.
        self.click_button_id("save-edit-sheet")

        # Searches for the edited sheet.
        self.type_entry_id("search-all", sheet_2)

        # Verifies that the entry has been inserted into the table.
        self.check_row("sheets-table", {"Sheet": sheet_2, "# Entries": 2})

        # Checks each of the questions.
        for question in questions:
            # Searches for the affected entry.
            self.type_entry_id("search-all", question)

            # Verifies that the entry has been inserted into the table.
            self.check_row("entries-table", {
                "Question": question, "# Mentions": 1
            })

    def test_003_create_delete_sheet(self) -> None:
        """Checks that an entry can be deleted.
        :return: None
        """
        # We wish to delete the following sheet.
        name = "Sheet to delete"

        # The sheet we wish to delete contains the following entry.
        question = "Entry in sheet to be deleted"

        # Opens the browser.
        self.go_to("/create")

        # Searches for the affected sheet.
        self.type_entry_id("search-all", name)

        # Clicks on the desired sheet.
        self.toggle_row("sheets-table", "Sheet", name)

        # Clicks on the delete button.
        self.click_button_id("delete-sheet")

        # Verifies row is deleted.
        self.check_no_row("sheets-table", "Sheet", name)

        # Searches for the affected sheet.
        self.type_entry_id("search-all", question)

        # Verifies that the entry has been inserted into the table.
        self.check_row("entries-table", {
            "Question": question, "# Mentions": 0
        })

        # Searches for the affected sheet.
        self.type_entry_id("search-all", name)

        # Again verifies row is deleted.
        self.check_no_row("sheets-table", "Sheet", name)

    def test_004_create_empty_sheet(self) -> None:
        """Checks that a sheet edited to have no mentions does not
        appear in the test list.
        :return: None
        """
        # We wish to empty the following sheet.
        name = "Sheet to be emptied"

        # The question to be removed from the sheet.
        question = "Entry in sheet to be emptied"

        # Opens the browser.
        self.go_to("/create")

        # Searches for the sheet to be emptied.
        self.type_entry_id("search-all", name)

        # Clicks on the desired sheet.
        self.toggle_row("sheets-table", "Sheet", name)

        # Clicks on the edit button.
        self.click_button_id("edit-sheet")

        # Searches for the entry to be removed from the sheet.
        self.type_entry_id("edit-sheet-search-entries", name)

        # Selects the entry to be removed from the sheet.
        self.toggle_row("edit-sheet-entries-table", "Question", question)

        # Saves the edited sheet.
        self.click_button_id("save-edit-sheet")

        # Goes to the home page.
        self.click_button_id("sidebar-left-home")

        # Goes to the home page.
        self.click_button_id("sidebar-left-home")

        # Goes to the test page.
        self.click_button_id("test-button")

        # Searches for the affected sheet.
        self.type_entry_id("search-sheets", name)

        # Verifies no row exists.
        self.check_no_row("sheets-table", "Sheet", name)
