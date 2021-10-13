import {
    bindButtonKeyPressEvents, disableAllTabbables, disableButtons,
    enableAllTabbables, enableButtons, getById, hide, openRequest, unhide
} from "../utils.js";
import {chooseSchema, getSchemaAnswers, searchAll} from "./create.js";

export function showEditEntryInterface(question) {
    disableAllTabbables("main");
    disableAllTabbables(document.querySelector(".sidebar"));

    enableAllTabbables("edit-entry-container-background");

    // If the user is showing the interface, having just been using the
    // schema interface, nothing on the dialog itself needs to be
    // updated.
    if (question == null) {
        unhide(['edit-entry-container-background']);
        getById('edit-entry-question').focus();
    }

    // If the user is opening the interface afresh, it populates the
    // dialog as necessary.
    else {
        editEntrySearchSheets();

        var editEntryQuestionEntry = getById('edit-entry-question');
        editEntryQuestionEntry.value = question;
        editEntryQuestionEntry.placeholder = question;

        enableButtons([["save-edit-entry", saveEditEntry]]);

        openRequest("/create/load_existing_entry", [
            ["question", question]
        ], processShowEditEntryInterface)
    }
}

function processShowEditEntryInterface(request) {
    var returnJSON = JSON.parse(request.responseText);

    var editEntryAnswerEntry = getById('edit-entry-answer');
    var answers = returnJSON["answers"];
    var schemaName = returnJSON["schema_name"];
    var picker = getById("edit-entry-schema-picker");

    if (schemaName == "") {
        editEntryAnswerEntry.value = answers[0];
        editEntryAnswerEntry.placeholder = answers[0];

        // Uses the picker to select "No schema:".
        picker.children[1].innerHTML = "No schema:";
        var pickerDivs = picker.children[2].getElementsByTagName("div");
        pickerDivs[0].classList.add("same-as-selected");
        for (var i = 1; i < pickerDivs.length; i ++) {
            pickerDivs[i].classList.remove("same-as-selected");
        }

        // Displays the default single answer option.
        unhide([
            "edit-entry-answer-div", "edit-entry-answers-table-container",
            "edit-entry-answer-text", "edit-entry-more-answers-text"
        ]);
        hide(["edit-entry-answer-schema-table"]);
        disableButtons(["edit-entry-edit-schema"]);

        var moreAnswers = document.querySelector(
            "#edit-entry-answers-table>tbody"
        );
        for (var i = 1; i < answers.length; i ++) {
            var newAdditionalAnswer = document.createElement("tr");

            var newAdditionalAnswerName = document.createElement("td");
            newAdditionalAnswerName.setAttribute("tabindex", "0");
            newAdditionalAnswerName.innerHTML = answers[i];
            newAdditionalAnswerName.onclick = editEntryPromoteAnswer;
            bindButtonKeyPressEvents(
                newAdditionalAnswerName, editEntryPromoteAnswer
            );

            var newAdditionalAnswerTrash = document.createElement("td");

            var newAdditionalAnswerButton = document.createElement("button");
            newAdditionalAnswerButton.innerHTML = "️️🗑️";
            newAdditionalAnswerButton.classList.add("trash-can");
            newAdditionalAnswerButton.onclick = trashRow;

            newAdditionalAnswerTrash.appendChild(newAdditionalAnswerButton);
            newAdditionalAnswer.appendChild(newAdditionalAnswerName);
            newAdditionalAnswer.appendChild(newAdditionalAnswerTrash);
            moreAnswers.insertBefore(
                newAdditionalAnswer, document.querySelector(
                    "#edit-entry-answers-table>tbody>tr:last-child"
                )
            );
        }
    }
    else {
        editEntryAnswerEntry.value = "";
        editEntryAnswerEntry.placeholder = "";

        // Uses the picker to select the appropriate schema.
        picker.children[1].innerHTML = schemaName;
        var pickerDivs = picker.children[2].getElementsByTagName("div");
        var j;
        for (var i = 0; i < pickerDivs.length; i ++) {
            if (pickerDivs[i].innerHTML == schemaName) {
                j = i;
                pickerDivs[i].classList.add("same-as-selected");
            }
            else {
                pickerDivs[i].classList.remove("same-as-selected");
            }
        }

        // Hides the default single answer option.
        unhide(["edit-entry-answer-schema-table"]);
        hide([
            "edit-entry-answer-div", "edit-entry-answers-table-container",
            "edit-entry-answer-text", "edit-entry-more-answers-text"
        ]);
        enableButtons(
            [["edit-entry-edit-schema", showSchemasInterface, "edit", "edit"]]
        );

        editEntryChooseSchema(picker.children[0][j], answers, true);
    }

    var sheets = returnJSON["sheets"];
    var hiddenRows = getById("edit-entry-sheet-table-hidden-rows");
    var visibleRows = getById("edit-entry-sheet-table-rows").children;

    for (var i = 0; i < sheets.length; i ++) {
        var hiddenRow = document.createElement("tr");
        hiddenRow.innerHTML = sheets[i];
        hiddenRows.appendChild(hiddenRow);

        for (var j = 0; j < visibleRows.length; j ++) {
            if (visibleRows[j].children[0].innerHTML == sheets[i]) {
                visibleRows[j].classList.add("selected-row");
                break;
            }
        }
    }

    unhide(['edit-entry-container-background']);
    getById('edit-entry-question').focus();
}

export function hideEditEntryInterface() {
    enableAllTabbables("main");
    enableAllTabbables(document.querySelector(".sidebar"));

    hide(['edit-entry-container-background']);
    getById('edit-entry-question').value = "";
    getById('edit-entry-answer').value = "";
    getById('edit-entry-search-sheets').value = "";
    getById('edit-entry-add-answer').value = "";

    var moreAnswers = document.querySelectorAll(
        "#edit-entry-answers-table>tbody>tr:not(:last-child)"
    );
    for (var i = 0; i < moreAnswers.length; i ++) {
        moreAnswers[i].remove();
    }

    hide(document.querySelectorAll(
        "#edit-entry-question-div>span,#edit-entry-answer-div>span"
    ));

    getById('edit-entry-sheet-table-hidden-rows').innerHTML = "";
}

export function keyDownOnEditEntryContainer(event) {
    // Checks that the escape key was pressed..
    if (event.key == "Escape") {
        hideEditEntryInterface();
    }
}

export function changeEditEntryQuestion() {
    var question = getById("edit-entry-question").value;

    if (question == "" || question.length > 80) {
    if (question == "") {
    unhide(["message-edit-entry-empty-question"]);
    hide([
    "message-edit-entry-long-question", "message-edit-entry-already-exists"
    ]);
    }
    else {
    hide([
    "message-edit-entry-empty-question",
    "message-edit-entry-already-exists"
    ]);
    unhide(["message-edit-entry-long-question"]);
    }
    disableButtons(["save-edit-entry"])
    }
    else {
        hide([
            "message-edit-entry-empty-question",
            "message-edit-entry-long-question"
        ]);
        var prior = getById("edit-entry-question").placeholder;

        openRequest("/create/entry_already_exists", [
            ["question", question], ["prior", prior]
            ], processChangeEditEntryQuestion
        );
    }
}

function processChangeEditEntryQuestion(request) {
    var result = JSON.parse(request.responseText)['already_there'];
    if (result) {
        disableButtons(["save-edit-entry"]);
        unhide(["message-edit-entry-already-exists"]);
    }
    // The question does not already exist.
    else {
        var answerLength = getById('edit-entry-answer').value.length;
        if (0 < answerLength && answerLength <= 80) {
            enableButtons([["save-edit-entry", saveEditEntry]]);
        }
        hide(["message-edit-entry-already-exists"]);
    }
}

export function changeEditEntryAnswer() {
    var answer = getById("edit-entry-answer").value;

    if (answer == "" || answer.length > 80) {
        if (answer == "") {
            unhide(["message-edit-entry-empty-answer"]);
            hide(["message-edit-entry-long-answer"]);
        }
        else {
            hide(["message-edit-entry-empty-answer"]);
            unhide(["message-edit-entry-long-answer"]);
        }
        disableButtons(["save-edit-entry"]);
    }
    else {
        hide([
            "message-edit-entry-empty-answer", "message-edit-entry-long-answer"
        ]);
        var problems = document.querySelectorAll(
            "edit-entry-question-div>span:not(.hide)"
        );
        if (
            problems.length == 0
            && getById("edit-entry-question").value.length > 0
        ) {
            enableButtons([["save-edit-entry", saveEditEntry]]);
        }
    }
}

export function editEntryAddRow() {
    var newAnswerInput = document.querySelector(
        "#edit-entry-answers-table>tbody>tr:last-child>td>input"
    );
    var newAnswer = newAnswerInput.value;

    // Only does something if an answer has been given.
    if (newAnswer == '') {
        return;
    }

    newAnswerInput.value = ""

    var mainAnswerInput = getById("edit-entry-answer");
    var moreAnswersCells = document.querySelectorAll(
        "#edit-entry-answers-table>tbody>tr:not(:last-child)>td:first-child"
    );

    if (mainAnswerInput.value == newAnswer) {
        return;
    }

    for (var i = 0; i < moreAnswersCells.length; i ++) {
        var anotherAnswer = moreAnswersCells[i].innerHTML;
        if (anotherAnswer == newAnswer) {
            return;
        }
    }

    var newLeftColumn = document.createElement("td");
    newLeftColumn.innerHTML = newAnswer;
    newLeftColumn.setAttribute("tabindex", "0");
    newLeftColumn.onclick = editEntryPromoteAnswer;
    bindButtonKeyPressEvents(newLeftColumn, editEntryPromoteAnswer);

    var newTrashButton = document.createElement("button");
    newTrashButton.innerHTML = "🗑️";
    newTrashButton.classList.add("trash-can");
    newTrashButton.onclick = trashRow;

    var newRightColumn = document.createElement("td");
    newRightColumn.appendChild(newTrashButton);

    var newRow = document.createElement("tr");
    newRow.appendChild(newLeftColumn);
    newRow.appendChild(newRightColumn);
    newRow.appendChild(newRightColumn);

    document.querySelector("#edit-entry-answers-table>tbody").insertBefore(
        newRow, document.querySelector(
            "#edit-entry-answers-table>tbody>tr:last-child"
        )
    );
    newAnswerInput.focus();
}

function trashRow() {
    this.parentNode.parentNode.remove();
}

export function editEntryHitEnterAnotherAnswer(event) {
    if (event.key == "Enter") {
        editEntryAddRow();
    }
}

function editEntryPromoteAnswer() {
    var formerTopAnswerInput = getById("edit-entry-answer");
    var formerTopAnswer = formerTopAnswerInput.value;
    formerTopAnswerInput.value = this.innerHTML;
    if (formerTopAnswer == "") {
        this.parentNode.remove();
        hide(["message-edit-entry-empty-answer"]);
    }
    else {
        this.innerHTML = formerTopAnswer;
    }
}

export function saveEditEntry() {
    var questionEntry = getById("edit-entry-question");
    var prior = questionEntry.placeholder;
    var question = questionEntry.value;
    var moreAnswersCells = document.querySelectorAll(
        "#edit-entry-answers-table>tbody>tr:not(:last-child)>td:first-child"
    );
    var answersString, answers, i;

    // If the user has chosen a particular schema.
    if (getById("edit-entry-answer-div").classList.contains("hide")) {
        answersString = JSON.stringify(getSchemaAnswers("edit"));
    }

    // If the user has not selected as schema.
    else {
        var answers = [getById("edit-entry-answer").value];
        for (i = 0; i < moreAnswersCells.length; i ++) {
            answers.push(moreAnswersCells[i].innerHTML);
        }
        answersString = JSON.stringify(answers);
    }

    var hiddenRows = getById("edit-entry-sheet-table-hidden-rows").children;
    var parentSheets = [];
    for (var i = 0; i < hiddenRows.length; i ++) {
        parentSheets.push(hiddenRows[i].innerHTML);
    }
    var parentSheetsString = JSON.stringify(parentSheets);

    openRequest("/create/edit_entry", [
        ["question", question], ["prior", prior], ["answers", answersString],
        ["sheets", parentSheetsString]
    ], processSaveEditEntry);
}

function processSaveEditEntry(request) {
    var already_there = JSON.parse(request.responseText)['already_there'];
    if (already_there) {
        alert("Sheet already made!");
    }
    else {
        hideEditEntryInterface();
        searchAll();
    }
}

export function clickEditEntrySheet() {
    if (this.classList.contains('selected-row')) {
        this.classList.remove('selected-row');
        var checkRows = getById('edit-entry-sheet-table-hidden-rows').children
        for (var i = 0; i < checkRows.length; i ++) {
            if (checkRows[i].innerHTML == this.firstChild.innerHTML) {
                checkRows[i].remove();
            }
        }
    }
    else {
        this.classList.add('selected-row');
        var newRow = getById(
            'edit-entry-sheet-table-hidden-rows'
        ).insertRow(-1);
        newRow.innerHTML = this.firstElementChild.innerHTML;
    }
}

export function editEntryLoadMoreSheets(numberAlready) {
    numberAlready = document.querySelectorAll(
        "#edit-entry-sheet-table-rows>tr"
    ).length

    // Finds the search query
    var query = getById("edit-entry-search-sheets").value;

    openRequest("/create/load_more_sheets", [
        ["already", numberAlready], ["query", query]
        ], processEditEntryLoadMoreSheets
    );
}

function processEditEntryLoadMoreSheets(request) {
    var returnJSON = JSON.parse(request.responseText);
    var rowsElement = getById('edit-entry-sheet-table-rows');
    var possibleMatches = getById(
        "edit-entry-sheet-table-hidden-rows"
    ).children;

    for (var i = 0; i < returnJSON['sheets'].length; i ++) {
        var foundHidden = false;
        for (var j = 0; j < possibleMatches.length; j++) {
            if (possibleMatches[j].innerHTML == returnJSON["sheets"][i][0]) {
                foundHidden = true;
                break;
            }
        }

        var newRow = document.createElement("tr");
        newRow.setAttribute("tabindex", "0");
        newRow.style["cursor"] = "pointer";
        newRow.onclick = clickEditEntrySheet;
        bindButtonKeyPressEvents(newRow, clickEditEntrySheet);

        for (var j = 0; j < 3; j ++) {
            var cell = document.createElement("td");
            cell.innerHTML = returnJSON["sheets"][i][j];
            newRow.appendChild(cell);
        }

        rowsElement.appendChild(newRow);

        if (foundHidden) {
            newRow.classList.add("selected-row");
        }
    }
    var loadMoreRow = getById('edit-entry-sheet-load-more-row');
    if (returnJSON['more_sheets'] == true) {
        loadMoreRow.style.visibility = 'visible';
    }
    else {
        loadMoreRow.style.visibility = 'collapse';
    }
}

export function editEntrySearchSheets() {
    // Finds the search query
    var query = getById("edit-entry-search-sheets").value;

    openRequest("/create/search", [
        ["query", query], ["sheets", 1], ["entries", 0]
    ], processEditEntrySearchSheets);
}

function processEditEntrySearchSheets(request) {
    var returnJSON = JSON.parse(request.responseText);
    var rowsElement = getById('edit-entry-sheet-table-rows');
    rowsElement.innerHTML = "";
    var possibleMatches = getById(
        "edit-entry-sheet-table-hidden-rows"
    ).children;

    for (var i = 0; i < returnJSON["sheets"].length; i ++) {
        var foundHidden = false;
        for (var j = 0; j < possibleMatches.length; j++) {
            if (possibleMatches[j].innerHTML == returnJSON["sheets"][i][0]) {
                foundHidden = true;
                break;
            }
        }

        var newRow = document.createElement("tr");
        newRow.setAttribute("tabindex", "0");
        newRow.style["cursor"] = "pointer";
        newRow.onclick = clickEditEntrySheet;
        bindButtonKeyPressEvents(newRow, clickEditEntrySheet);

        for (var j = 0; j < 3; j ++) {
            var cell = document.createElement("td");
            cell.innerHTML = returnJSON["sheets"][i][j];
            newRow.appendChild(cell);
        }

        rowsElement.appendChild(newRow);

        if (foundHidden) {
            newRow.classList.add("selected-row");
        }
    }

    var loadMoreRow = getById('edit-entry-sheet-load-more-row');
    if (returnJSON['more_sheets'] == true) {
        loadMoreRow.style.visibility = 'visible';
    }
    else {
        loadMoreRow.style.visibility = 'collapse';
    }
}

export function editEntryChooseSchema(selectOption, answers, isId) {
    if (answers === undefined) {
        answers = null;
    }
    chooseSchema(selectOption, "edit", answers, isId);
}
