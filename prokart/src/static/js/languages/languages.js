function updateTranslator() {
  if (document.querySelectorAll(
    "#translate-from .same-as-selected,#translate-to .same-as-selected"
  ).length == 2)
  {
    enableButtons([["save-button", saveTranslator]]);
  }
}

function saveTranslator() {
  var translateFrom = document.querySelector(
    "#translate-from>.select-selected"
  ).innerHTML.trim().slice(5);
  var translateTo = document.querySelector(
    "#translate-to>.select-selected"
  ).innerHTML.trim().slice(5);

  openRequest("/languages/update_translator", [
    ["from", translateFrom], ["to", translateTo]
  ], processSaveTranslator);
}

function processSaveTranslator(request) {
  window.location.href = "/";
}

function expandFlags(element) {
  var allCollapseFlags = document.getElementsByClassName("flag-button");
  var hiddenLanguages = getById("hidden-flags");
  element.classList.add("flag-drop-down");
  element.onclick = function () {
    condenseFlags(this);
  };

  if (allCollapseFlags.length == 0) {
    openRequest(
       "/languages/get_flags", [], processExpandFlags, element, hiddenLanguages
    );
  }
  else {
    hiddenLanguages.style.display = null;
  }
}

function processExpandFlags(request, element, hiddenLanguages) {
  returnJSON = JSON.parse(request.responseText);
  sheets = returnJSON["flags"];
  var hiddenFlags = getById("hidden-flags");

  for (var i = 0; i < sheets.length; i ++) {
    var flag = sheets[i][0];
    var country = sheets[i][1];

    var newButtonDiv = document.createElement("div");
    newButtonDiv.style.display = "inline-block";
    newButtonDiv.classList.add("tooltip");

    var newButton = document.createElement("button");
    newButtonDiv.appendChild(newButton);
    newButton.classList.add("flag-button");
    newButton.onclick = function () {
      selectFlag(this);
    };
    newButton.innerHTML = flag;
    if (flag == element.innerHTML) {
      newButton.style.display = "none";
    }
    hiddenFlags.appendChild(newButtonDiv);

    var tooltip = document.createElement("span");
    tooltip.classList.add("tooltip-text");
    tooltip.innerHTML = country;
    newButtonDiv.appendChild(tooltip);
  }
  hiddenLanguages.style.display = null;
}

function condenseFlags(element) {
  var hiddenLanguages = getById("hidden-flags");
  hiddenLanguages.style.display = "none";
  element.classList.remove("flag-drop-down");
  element.onclick = function () {
    expandFlags(this);
  }
}

function selectFlag(element) {
  var allCollapseFlags = document.getElementsByClassName("flag-button");
  for (var i = 0; i < allCollapseFlags.length; i ++) {
    allCollapseFlags[i].style.display = null;
  }
  element.style.display = "none";
  var flagButton = getById("choose-flag");
  flagButton.innerHTML = element.innerHTML;
  condenseFlags(flagButton);
  flagButton.focus();
}

function changeLanguageName() {
  var languageName = getById("language-name").value;

  if (languageName && languageName.length <= 40) {
    openRequest("/languages/check_language", [
      ["name", languageName]
    ], processChangeLanguageName);
  }
  else {
    disableButtons(["add-button"]);
  }
}

function processChangeLanguageName(request) {
  var returnJSON = JSON.parse(request.responseText);
  if (returnJSON["found"]) {
    disableButtons(["add-button"]);
  }
  else {
    enableButtons([["add-button", saveLanguage]]);
  }
}

function saveLanguage() {
  disableButtons(["add-button"]);

  var languageName = getById("language-name").value;
  var flagText = getById("choose-flag").innerHTML;

  openRequest("/languages/add_language", [
    ["name", languageName], ["flag", flagText]
  ], processSaveLanguage);
}

function processSaveLanguage(request) {
  window.location.reload(true);
}

function languagesPopulateSelectBoxes() {
  populateSelectBoxes(updateTranslator);
}

window.addEventListener('load', languagesPopulateSelectBoxes);
