# Local imports
from wordmuncher.unit_tests.base_tests import BasicTests


class TestLanguages(BasicTests):
    """Contains all tests relating to the languages area. The language
    area is where different languages are generated and selected for
    use.
    """
    def test_001_languages_new_language(self) -> None:
        """Checks that a new language can be created.
        :return: None
        """
        # We wish to add a language with the following name.
        language = "Swedish"

        # We wish to give the language the flag of the following
        # country.
        flag = "Sweden"

        # Opens the browser.
        self.go_to('/languages')

        # Clicks on the modify languages button.
        self.click_button_id("modify-languages")

        # Types in the new language name.
        self.type_entry_id("language-name", language)

        # Selects the flag to be used.
        self.pick_flag(flag)

        # Remembers the element for future reference.
        self.remember_element("add-button")

        # Saves the new language.
        self.click_button_id("add-button")

        # Waits until page reloads.
        self.wait_until_gone("add-button")

        # Checks that the new language has been added to the database.
        self.check_select_has_option("translate-from", language)

        # Checks that the new language has been added to the database.
        self.check_select_has_option("translate-to", language)

    def test_002_languages_use_translator(self) -> None:
        """Checks that the selected translator can be changed.
        :return: None
        """
        # We wish to translate from the following language.
        l_from = "German"

        # The flag for the language we're translating is as follows.
        f_from = "🇩🇪"

        # We wish to translate to the following language:
        l_to = "English"

        # The flag for the language from which we're translating is as
        # follows.
        f_to = "🇬🇧"

        # Opens the browser.
        self.go_to('/languages')

        # Clicks on the drop-down for the language being translated.
        self.select_option("translate-from", l_from)

        # Clicks on the drop-down for the language being translated.
        self.select_option("translate-to", l_to)

        # Remembers the element for future reference.
        self.remember_element("save-button")

        # Saves the new translator.
        self.click_button_id("save-button")

        # Waits until page reloads.
        self.wait_until_gone("save-button")

        # Checks that the translator has been loaded.
        self.check_translator(f_from, f_to)

    def test_003_languages_copy_language(self) -> None:
        """Checks that a language cannot be made with the name of
        another language.
        :return: None
        """
        # We wish to try creating a language with the following name.
        language = "English"

        # Opens the browser.
        self.go_to('/languages')

        # Clicks on the modify languages button.
        self.click_button_id("modify-languages")

        # Types in the new language name.
        self.type_entry_id("language-name", language)

        # Saves the new language.
        self.check_button_disabled("add-button")
