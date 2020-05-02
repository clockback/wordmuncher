function showEditLanguagesInterface(question) {
  disallowTabSelection([
    "modify-languages", "save-button", "sidebar-left-home",
    "sidebar-center-translator"
  ]);

  document.getElementById('languages-container-background').classList.remove(
    'hide'
  );
}

function hideLanguagesInterface() {
  document.getElementById('languages-container-background').classList.add(
    'hide'
  );
  document.getElementById('language-name').value = "";

  disableButtons(["add-button"]);
  allowTabSelection([
    "modify-languages", "save-button", "sidebar-left-home",
    "sidebar-center-translator"
  ]);
}

function keyDownOnLanguagesContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape")
  {
    hideLanguagesInterface();
  }
}
