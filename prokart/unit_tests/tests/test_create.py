# Local imports
from prokart.unit_tests.base_tests import BasicTests


class TestCreate(BasicTests):
    def test_check_menu_1(self) -> None:
        """Checks that the menu loads.
        :return: None
        """
        # Opens the browser.
        self.driver.go_to('/create')

        # Finds the translators button
        translator_button = self.driver.find_element_by_css_selector(
            '.sidebar-center>button'
        )

        # Checks that the flags have loaded.
        self.assertIn("→", translator_button.text)
