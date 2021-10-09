import {
    closeAllSelect, enableButtons, disableButtons, getById, openRequest,
    populateSelectBoxes
} from '../utils.js'

import {
    showEditLanguagesInterface, keyDownOnLanguagesContainer,
    hideLanguagesInterface
} from './edit_languages.js';

import {prepareEventsTopBar} from '../select_translator.js'

function updateTranslator() {
    if (document.querySelectorAll(
        "#translate-from .same-as-selected,#translate-to .same-as-selected"
    ).length == 2) {
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

function expandFlags() {
    var allCollapseFlags = document.getElementsByClassName("flag-button");
    var hiddenLanguages = getById("hidden-flags");
    this.classList.add("flag-drop-down");
    this.onclick = condenseFlags;

    if (allCollapseFlags.length == 0) {
        openRequest(
            "/languages/get_flags", [], processExpandFlags, this, hiddenLanguages
        );
    }
    else {
        hiddenLanguages.style.display = null;
    }
}

function processExpandFlags(request, element, hiddenLanguages) {
    var returnJSON = JSON.parse(request.responseText);
    var sheets = returnJSON["flags"];
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

function condenseFlags() {
    var hiddenLanguages = getById("hidden-flags");
    hiddenLanguages.style.display = "none";
    this.classList.remove("flag-drop-down");
    this.onclick = expandFlags;
}

function selectFlag(element) {
    var allCollapseFlags = document.getElementsByClassName("flag-button");
    for (var i = 0; i < allCollapseFlags.length; i ++) {
        allCollapseFlags[i].style.display = null;
    }
    element.style.display = "none";
    var flagButton = getById("choose-flag");
    flagButton.innerHTML = element.innerHTML;
    condenseFlags.call(flagButton);
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

function prepareEventsLanguages() {
    document.querySelector("html").onclick = closeAllSelect;
    getById("modify-languages").onclick = showEditLanguagesInterface;
    getById("languages-container-background").onkeydown = (
        keyDownOnLanguagesContainer
    );
    document.querySelector(".title-bar>div").onclick = hideLanguagesInterface;
    getById("language-name").oninput = changeLanguageName;
    getById("choose-flag").onclick = expandFlags;
    getById("languages-back").onclick = hideLanguagesInterface;

    prepareEventsTopBar();
}

window.addEventListener('load', prepareEventsLanguages);
window.addEventListener('load', languagesPopulateSelectBoxes);
