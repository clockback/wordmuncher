function showEditLanguagesInterface(question) {
  disallowTabSelection([
    "modify-languages", "save-button", "sidebar-left-home",
    "sidebar-center-translator"
  ]);
  unhide(['languages-container-background']);
  getById('language-name').focus();
}

function hideLanguagesInterface() {
  hide(['languages-container-background']);
  getById('language-name').value = "";

  disableButtons(["add-button"]);
  allowTabSelection([
    "modify-languages", "save-button", "sidebar-left-home",
    "sidebar-center-translator"
  ]);
}

function keyDownOnLanguagesContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideLanguagesInterface();
  }
}
