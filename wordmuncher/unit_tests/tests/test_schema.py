# Local imports
from wordmuncher.unit_tests.base_tests import BasicTests


class TestSchema(BasicTests):
    """Contains all tests relating to the creation area when using
    schemas. The creation area is where different vocabulary sheets and
    entries are created and edited.
    """
    def test_001_schema_new_entry_new_1d_schema(self) -> None:
        """Checks that a new entry can be created using a new 1-D
        schema.
        :return: None
        """
        # Chooses to create a schema with the name "A new schema".
        schema_name = "A new 1-D schema"

        # We wish to add the following question to the sheet.
        question = "New entry with new 1-D schema"

        # Chooses to use the following subschema name.
        subschema = "Subschema"

        # Chooses to use the following qualities.
        qualities = ["A", "B", "C", "D", "E"]

        # Chooses what answers are appropriate for the question.
        answers = {"A": "1", "C": "2"}

        # Opens the browser.
        self.go_to('/create')

        # Clicks the new entry button.
        self.click_button_id("new-entry")

        # Types in the question for the new entry
        self.type_entry_id("new-entry-question", question)

        # Clicks the new schema button.
        self.click_button_id("new-entry-new-schema")

        # Fills out the new schema name.
        self.type_entry_id("schema-name", schema_name)

        # Populates the schema.
        self.configure_schema(subschema, qualities)

        # Saves the schema.
        self.click_button_id("save-schema")

        # Populates the schema.
        self.populate_schema_create(answers, "new")

        # Saves the new entry.
        self.click_button_id("save-new-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Verifies that the table has been stored and loaded properly.
        self.verify_schema_answers(answers)

    def test_002_schema_new_entry_new_2d_schema(self) -> None:
        """Checks that a new entry can be created using a new 2-D
        schema.
        :return: None
        """
        # Chooses to create a schema with the name "A new schema".
        schema_name = "A new 2-D schema"

        # We wish to add the following question to the sheet.
        question = "New entry with new 2-D schema"

        # Chooses to use the following subschema name.
        subschema = ("Subschema 1", "Subschema 2")

        # Chooses to use the following qualities.
        qualities = (["A", "B", "C"], ["X", "Y", "Z"])

        # Chooses what answers are appropriate for the question.
        answers = {("A", "Y"): "1", ("B", "Z"): "2", ("C", "X"): "3"}

        # Opens the browser.
        self.go_to('/create')

        # Clicks the new entry button.
        self.click_button_id("new-entry")

        # Types in the question for the new entry
        self.type_entry_id("new-entry-question", question)

        # Clicks the new schema button.
        self.click_button_id("new-entry-new-schema")

        # Fills out the new schema name.
        self.type_entry_id("schema-name", schema_name)

        # Populates the schema.
        self.configure_schema(subschema, qualities)

        # Saves the schema.
        self.click_button_id("save-schema")

        # Populates the schema.
        self.populate_schema_create(answers, "new")

        # Saves the new entry.
        self.click_button_id("save-new-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Verifies that the table has been stored and loaded properly.
        self.verify_schema_answers(answers)

    def test_003_schema_edit_entry_old_1d_schema(self) -> None:
        """Checks that an old entry can be modified to use an existing
        1-D schema.
        :return: None
        """
        # Chooses to use a schema with the name "An existing 1-D
        # schema".
        schema_name = "An existing 1-D schema"

        # We wish to edit the following question to the sheet.
        question = "Give entry existing 1-D schema"

        # Chooses what answers are appropriate for the question.
        answers = {"Column 1": "a", "Column 2": "b"}

        # Opens the browser.
        self.go_to('/create')

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Selects the desired schema.
        self.select_option("edit-entry-schema-picker", schema_name)

        # Populates the schema.
        self.populate_schema_create(answers, "edit")

        # Saves the new entry.
        self.click_button_id("save-edit-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Verifies that the table has been stored and loaded properly.
        self.verify_schema_answers(answers)

    def test_004_schema_edit_entry_old_2d_schema(self) -> None:
        """Checks that an old entry can be modified to use an existing
        2-D schema.
        :return: None
        """
        # Chooses to use a schema with the name "An existing 2-D
        # schema".
        schema_name = "An existing 2-D schema"

        # We wish to edit the following question to the sheet.
        question = "Give entry existing 2-D schema"

        # Chooses what answers are appropriate for the question.
        answers = {("Column 1", "Row 2"): "a", ("Column 2", "Row 1"): "b"}

        # Opens the browser.
        self.go_to('/create')

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Selects the desired schema.
        self.select_option("edit-entry-schema-picker", schema_name)

        # Populates the schema.
        self.populate_schema_create(answers, "edit")

        # Saves the new entry.
        self.click_button_id("save-edit-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Verifies that the table has been stored and loaded properly.
        self.verify_schema_answers(answers)

    def test_005_schema_edit_entry_alter_1d_schema(self) -> None:
        """Checks that both an old entry and its 1-D schema can be
        modified.
        :return: None
        """
        # We wish to edit the following question to the sheet.
        question = "Modify entry and 1-D schema"

        # Chooses what answers will exist after the table is
        # restructured.
        restructured_answers = {"B": "2"}

        # Chooses what answers to apply after the table is restructured.
        final_answers = {"B": "2", "C": "3"}

        # Opens the browser.
        self.go_to('/create')

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Modifies the schema.
        self.click_button_id("edit-entry-edit-schema")

        # Removes quality A.
        self.remove_quality("columns", "A")

        # Adds quality C.
        self.add_quality("columns", "C")

        # Saves the schema.
        self.click_button_id("save-schema")

        # Verifies the restructured answers.
        self.verify_schema_answers(restructured_answers)

        # Updates the answers.
        self.populate_schema_create(final_answers, "edit")

        # Saves the new entry.
        self.click_button_id("save-edit-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Verifies that the table has been stored and loaded properly.
        self.verify_schema_answers(final_answers)

    def test_006_schema_edit_entry_alter_2d_schema(self) -> None:
        """Checks that both an old entry and its 2-D schema can be
        modified.
        :return: None
        """
        # We wish to edit the following question to the sheet.
        question = "Modify entry and 2-D schema"

        # Chooses what answers will exist after the table is
        # restructured.
        restructured_answers = {("Y", "B"): "d"}

        # Chooses what answers to apply after the table is restructured.
        final_answers = {("Y", "B"): "d", ("Z", "C"): "e"}

        # Opens the browser.
        self.go_to('/create')

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Modifies the schema.
        self.click_button_id("edit-entry-edit-schema")

        # Removes quality A.
        self.remove_quality("columns", "A")

        # Adds quality C.
        self.add_quality("columns", "C")

        # Removes quality A.
        self.remove_quality("rows", "X")

        # Adds quality C.
        self.add_quality("rows", "Z")

        # Swaps the subschemas.
        self.swap_subschemas()

        # Saves the schema.
        self.click_button_id("save-schema")

        # Verifies the restructured answers.
        self.verify_schema_answers(restructured_answers)

        # Updates the answers.
        self.populate_schema_create(final_answers, "edit")

        # Saves the new entry.
        self.click_button_id("save-edit-entry")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Verifies that the table has been stored and loaded properly.
        self.verify_schema_answers(final_answers)

    def test_007_schema_delete_schema(self) -> None:
        """Checks that both an old entry and its 2-D schema can be
        modified.
        :return: None
        """
        # We wish to remove implicitly the following question to the
        # sheet.
        question = "Entry to be removed by schema-deletion"

        # We wish to delete the following schema.
        schema = "Delete this schema"

        # Opens the browser.
        self.go_to('/create')

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Clicks on the edit button.
        self.click_button_id("edit-entry")

        # Modifies the schema.
        self.click_button_id("edit-entry-edit-schema")

        # Starts the process of deleting the schema.
        self.click_button_id("delete-schema")

        # Types in the name of the schema to be deleted.
        self.type_entry_id("delete-schema-name", schema)

        # Starts the process of deleting the schema.
        self.click_button_id("delete-schema-delete")

        # Searches for the newly made entry.
        self.type_entry_id("search-all", question)

        # Verifies row is deleted.
        self.check_no_row("entries-table", "Question", question)

        # Clicks the new entry button.
        self.click_button_id("new-entry")

        # Checks that the select option has been removed.
        self.check_select_has_option(
            "new-entry-schema-picker", schema, find=False
        )

    def test_008_schema_1d_to_2d(self) -> None:
        """Checks that a schema can be transformed from 1D to 2D.
        :return: None
        """
        # We wish to remove implicitly the following question to the
        # sheet.
        question = "Entry using schema to be redimensioned to 2D"

        # We wish to delete the following schema.
        schema = "Make this 1D schema 2D"

        # Chooses what answers will exist after the table is
        # restructured.
        restructured_answers = {
            ("Column 1", "Single row"): "a", ("Column 2", "Single row"): "b"
        }

        # Opens the browser.
        self.go_to('/create')

        # Clicks the new entry button.
        self.click_button_id("new-entry")

        # Selects the schema to be redimensioned.
        self.select_option("new-entry-schema-picker", schema)

        # Prepares to edit the schema.
        self.click_button_id("new-entry-edit-schema")

        # Makes schema 2D.
        self.click_button_id("add-remove-rows-subschema")

        # Saves the schema.
        self.click_button_id("save-schema")

        # Closes the new entry interface.
        self.click_button_id("back-new-entry")

        # Finds the entry which used the schema.
        self.type_entry_id("search-all", question)

        # Clicks on the desired entry.
        self.toggle_row("entries-table", "Question", question)

        # Opens the edit interface.
        self.click_button_id("edit-entry")

        # Verifies the answers.
        self.verify_schema_answers(restructured_answers)
