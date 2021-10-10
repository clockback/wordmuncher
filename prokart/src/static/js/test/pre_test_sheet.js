import {
    changeRangeValue, disableAllTabbables, enableAllTabbables, getById, hide,
    unhide
} from '../utils.js';

export function testSheet() {
    var container = getById("pre-test-sheet-container-background");
    container.querySelector(
        "div>div.container-contents>h1"
    ).innerHTML = this.children[0].innerHTML;

    // Prevents selection of now concealed elements.
    disableAllTabbables("main");
    disableAllTabbables(document.querySelector(".sidebar"));

    var bar = container.querySelector("div.bar-chart-container");
    var percentage = this.children[1].innerHTML;

    bar.children[0].style.width = percentage + "%";
    bar.children[1].innerHTML = percentage + "% complete";

    if (percentage == 0) {
        bar.children[0].style.visibility = "hidden";
    }
    else {
        bar.children[0].style.visibility = null;
    }

    // Make container visible.
    unhide([container]);

    getById("go-button-container").focus();
}

export function hideTestSheetInterface() {
    // Prevents selection of now concealed elements.
    enableAllTabbables("main");
    enableAllTabbables(document.querySelector(".sidebar"));

    hide(["pre-test-sheet-container-background"]);
}

export function keyDownOnTestSheetContainer(event) {
    // Checks that the escape key was pressed..
    if (event.key == "Escape") {
        hideTestSheetInterface();
    }
}

export function goTestSheet(textBox) {
    var sheetName = document.querySelector(
        "div.container-contents>h1"
    ).innerHTML;

    sessionStorage.noQuestions = getById("no-questions").value;
    sessionStorage.completed = false;
    window.location.href = "/test/" + encodeURIComponent(sheetName);
}

export function updateNumberOfQuestions() {
    changeRangeValue("no-questions");
}
