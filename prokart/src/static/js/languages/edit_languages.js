function showEditLanguagesInterface(question) {
  disallowTabSelection([
    "modify-languages", "save-button", "sidebar-left-home",
    "sidebar-center-translator"
  ]);
  getById('languages-container-background').classList.remove('hide');
  getById('language-name').focus();
}

function hideLanguagesInterface() {
  getById('languages-container-background').classList.add('hide');
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
