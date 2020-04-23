# Local imports
from prokart.unit_tests.base_tests import BasicTests


class TestCreate(BasicTests):
    """Contains all tests relating to the creation area. The creation
    area is where different vocabulary sheets and entries are created
    and edited.
    """
    def test_001_create_new_sheet(self) -> None:
        """Checks that a new sheet can be created.
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

    def test_005_create_new_sheet_no_name(self) -> None:
        """Checks that a sheet cannot be created without a name.
        :return: None
        """
        # Opens the browser.
        self.go_to("/create")

        # Clicks on the new sheet button.
        self.click_button_id("new-sheet")

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-new-sheet")

        # Writes a placeholder sheet name to refresh the page.
        self.type_entry_id("new-sheet-name", " ")

        # Ensures there is no message that appears falsely.
        self.check_visibility("message-new-sheet-empty-name", False)

        # Wipes the sheet name.
        self.type_entry_id("new-sheet-name", "")

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-new-sheet")

        # Ensures that a message is alerting the user to the problem.
        self.check_visibility("message-new-sheet-empty-name", True)

    def test_006_create_new_sheet_copy_name(self) -> None:
        """Checks that a sheet cannot be created with the same name as
        another sheet.
        :return: None
        """
        # We wish to copy the following name.
        name = "Sheet with name to copy"

        # Opens the browser.
        self.go_to("/create")

        # Clicks on the new sheet button.
        self.click_button_id("new-sheet")

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-new-sheet")

        # Writes a placeholder sheet name to refresh the page.
        self.type_entry_id("new-sheet-name", name)

        # Ensures that a message is alerting the user to the problem.
        self.check_visibility("message-new-sheet-already-exists", True)

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-new-sheet")

    def test_007_create_new_sheet_long_name(self) -> None:
        """Checks that a sheet cannot be created with a very long name.
        :return: None
        """
        # We wish to copy the following name.
        name = f"Really {'really ' * 10}long name"

        # Opens the browser.
        self.go_to("/create")

        # Clicks on the new sheet button.
        self.click_button_id("new-sheet")

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-new-sheet")

        # Writes a placeholder sheet name to refresh the page.
        self.type_entry_id("new-sheet-name", name)

        # Ensures that a message is alerting the user to the problem.
        self.check_visibility("message-new-sheet-long-name", True)

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-new-sheet")

    def test_008_create_edit_sheet_no_name(self) -> None:
        """Checks that a sheet cannot have its name removed.
        :return: None
        """
        # We wish to try editing the following sheet.
        name = "Sheet no editing allowed"

        # Opens the browser.
        self.go_to("/create")

        # Searches for the sheet
        self.type_entry_id("search-all", name)

        # Selects the sheet.
        self.toggle_row("sheets-table", "Sheet", name)

        # Clicks on the edit sheet button.
        self.click_button_id("edit-sheet")

        # Ensures that the save button is disabled.
        self.check_button_enabled("save-edit-sheet")

        # Wipes the sheet name.
        self.type_entry_id("edit-sheet-name", "")

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-edit-sheet")

        # Ensures that a message is alerting the user to the problem.
        self.check_visibility("message-edit-sheet-empty-name", True)

    def test_009_create_edit_sheet_copy_name(self) -> None:
        """Checks that a sheet cannot be created with the same name as
        another sheet.
        :return: None
        """
        # We wish to try editing the following sheet.
        sheet_1 = "Sheet no editing allowed"

        # We wish to copy the following name.
        sheet_2 = "Sheet with name to copy"

        # Opens the browser.
        self.go_to("/create")

        # Searches for the sheet
        self.type_entry_id("search-all", sheet_1)

        # Selects the sheet.
        self.toggle_row("sheets-table", "Sheet", sheet_1)

        # Clicks on the new sheet button.
        self.click_button_id("edit-sheet")

        # Writes a placeholder sheet name to refresh the page.
        self.type_entry_id("edit-sheet-name", sheet_2)

        # Ensures that a message is alerting the user to the problem.
        self.check_visibility("message-edit-sheet-already-exists", True)

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-edit-sheet")

    def test_010_create_edit_sheet_long_name(self) -> None:
        """Checks that a sheet cannot be edited to have a very long
        name.
        :return: None
        """
        # We wish to try editing the following sheet.
        sheet_1 = f"Sheet no editing allowed"

        # We wish to copy the following name.
        sheet_2 = f"Really {'really ' * 10}long name"

        # Opens the browser.
        self.go_to("/create")

        # Searches for the sheet
        self.type_entry_id("search-all", sheet_1)

        # Selects the sheet.
        self.toggle_row("sheets-table", "Sheet", sheet_1)

        # Clicks on the edit sheet button.
        self.click_button_id("edit-sheet")

        # Tries replacing the name with something very long.
        self.type_entry_id("edit-sheet-name", sheet_2)

        # Ensures that a message is alerting the user to the problem.
        self.check_visibility("message-edit-sheet-long-name", True)

        # Ensures that the save button is disabled.
        self.check_button_disabled("save-edit-sheet")

    def test_011_create_new_entry(self) -> None:
        """Checks that a new entry can be created.
        :return: None
        """
        # Chooses to create an entry with the question "A new entry".
        question = "A new entry"

        # We wish to give the following primary answer to the entry.
        answer = "test"

        # We wish to put the entry in the following sheet.
        sheet = "Sheet without entry"

        # We wish to also give the following answers.
        others = ["test 1", "test 2"]

        # Opens the browser.
        self.go_to('/create')

        # Clicks the new entry button.
        self.click_button_id("new-entry")

        # Types in the question for the new entry
        self.type_entry_id("new-entry-question", question)

        # Types in the question for the new entry
        self.type_entry_id("new-entry-answer", answer)

        # Changes the additional answers.
        self.allot_additional_answers(others)

        # Searches for the desired entry.
        self.type_entry_id("new-entry-search-sheets", sheet)

        # Clicks on the desired entry.
        self.toggle_row("add-entry-entries-table", "Sheet", sheet)

        # Saves the new entry.
        self.click_button_id("save-new-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Verifies that the entry has been inserted into the table.
        self.check_row("entries-table", {
            "Question": question, "# Mentions": 1
        })

        # Searches for the affected made sheet.
        self.type_entry_id("search-all", sheet)

        # Verifies that the sheet has received the sheet.
        self.check_row("sheets-table", {"Sheet": sheet, "# Entries": 1})
