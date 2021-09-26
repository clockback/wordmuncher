function showNewEntryInterface() {
  disallowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  newEntrySearchSheets();
  unhide(["new-entry-container-background"]);
  getById('new-entry-question').focus();
}

function hideNewEntryInterface() {
  allowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  hide(['new-entry-container-background']);

  pickNoSchema("new");

  getById('new-entry-question').value = "";
  getById('new-entry-answer').value = "";
  getById('new-entry-search-sheets').value = "";
  getById('new-entry-add-answer').value = "";

  var moreAnswers = document.querySelectorAll(
    "#new-entry-answers-table>tbody>tr:not(:last-child)"
  );
  for (var i = 0; i < moreAnswers.length; i ++) {
    moreAnswers[i].remove();
  }

  hide(document.querySelectorAll(
    "#new-entry-question-div>span,#new-entry-answer-div>span"
  ));

  disableButtons(["save-new-entry"]);

  getById('new-entry-sheet-table-hidden-rows').innerHTML = "";
}

function keyDownOnNewEntryContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideNewEntryInterface();
  }
}

function changeNewEntryQuestion() {
  var question = getById("new-entry-question").value;

  if (question == "" || question.length > 80) {
    if (question == "") {
      unhide(["message-new-entry-empty-question"]);
      hide([
        "message-new-entry-long-question", "message-new-entry-already-exists"
      ]);
    }
    else {
      hide([
          "message-new-entry-empty-question",
          "message-new-entry-already-exists"
        ]);
      unhide(["message-new-entry-long-question"]);
    }
    disableButtons(["save-new-entry"]);
  }
  else {
    hide([
      "message-new-entry-empty-question", "message-new-entry-long-question"
    ]);

    openRequest("/create/entry_already_exists", [
      ["question", question]
    ], processChangeNewEntryQuestion);
  }
}

function processChangeNewEntryQuestion(request) {
  var result = JSON.parse(request.responseText)['already_there'];
  if (result) {
    disableButtons(["save-new-entry"]);
    unhide(["message-new-entry-already-exists"]);
  }
  // The question does not already exist.
  else {
    var answer = getById('new-entry-answer');
    var answerLength = answer.value.length;
    if ((
      answer.classList.contains("hide")
      && 0 < answerLength && answerLength <= 80
    ) || validSchemaAnswer("new")) {
      enableButtons([["save-new-entry", saveNewEntry]]);
    }
    hide(["message-new-entry-already-exists"]);
  }
}

function changeNewEntryAnswer() {
  var answer = getById("new-entry-answer").value;

  if (answer == "" || answer.length > 80) {
    if (answer == "") {
      unhide(["message-new-entry-empty-answer"]);
      hide(["message-new-entry-long-answer"]);
    }
    else {
      hide(["message-new-entry-empty-answer"]);
      unhide(["message-new-entry-long-answer"]);
    }
    disableButtons(["save-new-entry"]);
  }
  else {
    hide(["message-new-entry-empty-answer", "message-new-entry-long-answer"]);
    var problems = document.querySelectorAll(
      "new-entry-question-div>span:not(.hide)"
    );
    if (
      problems.length == 0 && getById("new-entry-question").value.length > 0
    ) {
      enableButtons([["save-new-entry", saveNewEntry]]);
    }
  }
}

function newEntryAddRow() {
  var newAnswerInput = document.querySelector(
    "#new-entry-answers-table>tbody>tr:last-child>td>input"
  );
  var newAnswer = newAnswerInput.value;

  // Only does something if an answer has been given.
  if (newAnswer == '') {
    return;
  }

  newAnswerInput.value = ""

  var mainAnswerInput = getById("new-entry-answer");
  var moreAnswersCells = document.querySelectorAll(
    "#new-entry-answers-table>tbody>tr:not(:last-child)>td:first-child"
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
  newLeftColumn.onclick = function () {
    newEntryPromoteAnswer(this);
  };

  var newTrashButton = document.createElement("button");
  newTrashButton.innerHTML = "🗑️";
  newTrashButton.classList.add("trash-can");
  newTrashButton.onclick = function () {
    trashRow(this);
  }

  var newRightColumn = document.createElement("td");
  newRightColumn.appendChild(newTrashButton);

  var newRow = document.createElement("tr");
  newRow.appendChild(newLeftColumn);
  newRow.appendChild(newRightColumn);
  newRow.appendChild(newRightColumn);

  document.querySelector("#new-entry-answers-table>tbody").insertBefore(
    newRow, document.querySelector(
      "#new-entry-answers-table>tbody>tr:last-child"
    )
  );
  newAnswerInput.focus();
}

function trashRow(button) {
  button.parentNode.parentNode.remove();
}

function newEntryHitEnterAnotherAnswer(event) {
  if (event.key == "Enter") {
    newEntryAddRow();
  }
}

function newEntryPromoteAnswer(promoteCell) {
  var formerTopAnswerInput = getById("new-entry-answer");
  var formerTopAnswer = formerTopAnswerInput.value;
  formerTopAnswerInput.value = promoteCell.innerHTML;
  if (formerTopAnswer == "") {
    promoteCell.parentNode.remove();
    hide(["message-new-entry-empty-answer"]);
  }
  else {
    promoteCell.innerHTML = formerTopAnswer;
  }
}

function saveNewEntry() {
  var question = getById("new-entry-question").value;
  var moreAnswersCells = document.querySelectorAll(
    "#new-entry-answers-table>tbody>tr:not(:last-child)>td:first-child"
  );
  var answersString, answers, i;

  // If the user has chosen a particular schema.
  if (getById("new-entry-answer-div").classList.contains("hide")) {
    answersString = JSON.stringify(getSchemaAnswers("new"));
  }

  // If the user has not selected a schema.
  else {
    var answers = [getById("new-entry-answer").value];
    for (var i = 0; i < moreAnswersCells.length; i ++) {
      answers.push(moreAnswersCells[i].innerHTML);
    }
    answersString = JSON.stringify(answers);
  }

  var hiddenRows = getById("new-entry-sheet-table-hidden-rows").children;
  var parentSheets = [];
  for (var i = 0; i < hiddenRows.length; i ++) {
    parentSheets.push(hiddenRows[i].innerHTML);
  }
  var parentSheetsString = JSON.stringify(parentSheets);

  openRequest("/create/new_entry", [
    ["question", question], ["answers", answersString],
    ["sheets", parentSheetsString]
  ], processSaveNewEntry);
}

function processSaveNewEntry(request) {
  hideNewEntryInterface();
  searchAll();
}

function clickNewEntrySheet(entry) {
  if (entry.classList.contains('selected-row')) {
    entry.classList.remove('selected-row');
    var checkRows = getById('new-entry-sheet-table-hidden-rows').children
    for (var i = 0; i < checkRows.length; i ++) {
      if (checkRows[i].innerHTML == entry.firstChild.innerHTML) {
        checkRows[i].remove();
      }
    }
  }
  else {
    entry.classList.add('selected-row');
    var newRow = getById('new-entry-sheet-table-hidden-rows').insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function newEntryLoadMoreSheets(numberAlready) {
  numberAlready = document.querySelectorAll(
    "#add-entry-sheet-table-rows>tr"
  ).length

  // Finds the search query
  query = getById("new-entry-search-sheets").value;

  openRequest("/create/load_more_sheets", [
    ["already", numberAlready], ["query", query]
  ], processNewEntryLoadMoreSheets);
}

function processNewEntryLoadMoreSheets(request) {
var returnJSON = JSON.parse(request.responseText);
  rowsElement = getById('add-entry-sheet-table-rows');
  var possibleMatches = getById(
    "new-entry-sheet-table-hidden-rows"
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
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickNewEntrySheet(this);
    }

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
  var loadMoreRow = getById('new-entry-sheet-load-more-row');
  if (returnJSON['more_sheets'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function newEntrySearchSheets() {
  // Finds the search query
  query = getById("new-entry-search-sheets").value;

  openRequest("/create/search", [
    ["query", query], ["sheets", 1], ["entries", 0]
  ], processNewEntrySearchSheets);
}

function processNewEntrySearchSheets(request) {
  var returnJSON = JSON.parse(request.responseText);
  var rowsElement = getById('add-entry-sheet-table-rows');
  rowsElement.innerHTML = "";
  var possibleMatches = getById(
    "new-entry-sheet-table-hidden-rows"
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
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickNewEntrySheet(this);
    }

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

  var loadMoreRow = getById('new-entry-sheet-load-more-row');
  if (returnJSON['more_sheets'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function newEntryChooseSchema(selectOption) {
  chooseSchema(selectOption, "new", null);
}
