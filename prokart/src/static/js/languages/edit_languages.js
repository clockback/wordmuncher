export function showEditLanguagesInterface(question) {
  disableAllTabbables("main");
  disableAllTabbables(document.querySelector(".sidebar"));

  unhide(['languages-container-background']);
  getById('language-name').focus();
}

export function hideLanguagesInterface() {
  hide(['languages-container-background']);
  getById('language-name').value = "";

  disableButtons(["add-button"]);

  enableAllTabbables("main");
  enableAllTabbables(document.querySelector(".sidebar"));
}

export function keyDownOnLanguagesContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideLanguagesInterface();
  }
}
