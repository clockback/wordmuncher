function showEditEntryInterface(question) {
  disallowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  editEntrySearchSheets();

  var editEntryQuestionEntry = getById('edit-entry-question');
  editEntryQuestionEntry.value = question;
  editEntryQuestionEntry.placeholder = question;

  var editEntryAnswerEntry = getById('edit-entry-answer');

  enableButtons([["save-edit-entry", saveEditEntry]]);

  var request = new XMLHttpRequest();

  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    editEntryAnswerEntry.value = returnJSON["answers"][0];
    editEntryAnswerEntry.placeholder = returnJSON["answers"][0];

    var moreAnswers = document.querySelector(
      "#edit-entry-answers-table>tbody"
    );
    for (var i = 1; i < returnJSON["answers"].length; i ++) {
      var newAdditionalAnswer = document.createElement("tr");

      var newAdditionalAnswerName = document.createElement("td");
      newAdditionalAnswerName.innerHTML = returnJSON["answers"][i];
      newAdditionalAnswerName.onclick = function () {
        editEntryPromoteAnswer(this);
      };

      var newAdditionalAnswerTrash = document.createElement("td");

      var newAdditionalAnswerButton = document.createElement("button");
      newAdditionalAnswerButton.innerHTML = "️️🗑️";
      newAdditionalAnswerButton.classList.add("trash-can");
      newAdditionalAnswerButton.onclick = function () {
        trashRow(this);
      };

      newAdditionalAnswerTrash.appendChild(newAdditionalAnswerButton);
      newAdditionalAnswer.appendChild(newAdditionalAnswerName);
      newAdditionalAnswer.appendChild(newAdditionalAnswerTrash);
      moreAnswers.insertBefore(
        newAdditionalAnswer, document.querySelector(
          "#edit-entry-answers-table>tbody>tr:last-child"
        )
      );
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

    getById('edit-entry-container-background').classList.remove('hide');
    editEntryQuestionEntry.focus();
  }

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/load_existing_entry?question="
    + encodeURIComponent(question), true
  );

  // Sends the request off.
  request.send();
}

function hideEditEntryInterface() {
  allowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  getById('edit-entry-container-background').classList.add('hide');
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

  var warnings = document.querySelectorAll(
    "#edit-entry-question-div>span,#edit-entry-answer-div>span"
  );
  for (var i = 0; i < warnings.length; i ++) {
    warnings[i].classList.add("hide");
  }

  getById('edit-entry-sheet-table-hidden-rows').innerHTML = "";
}

function keyDownOnEditEntryContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideEditEntryInterface();
  }
}

function changeEditEntryQuestion() {
  var question = getById("edit-entry-question").value;
  var messageEditEntryExists = getById("message-edit-entry-already-exists");
  var messageEditEntryEmpty = getById("message-edit-entry-empty-question");
  var messageEditEntryLong = getById("message-edit-entry-long-question");

  if (question == "" || question.length > 80) {
    if (question == "") {
      messageEditEntryEmpty.classList.remove("hide");
      messageEditEntryLong.classList.add("hide");
    }
    else {
      messageEditEntryEmpty.classList.add("hide");
      messageEditEntryLong.classList.remove("hide");
    }
    disableButtons(["save-edit-entry"])
    messageEditEntryExists.classList.add("hide");
  }
  else {
    messageEditEntryEmpty.classList.add("hide");
    messageEditEntryLong.classList.add("hide");
    var request = new XMLHttpRequest();

    request.onload = function() {
      var result = JSON.parse(request.responseText)['already_there'];
      if (result) {
        disableButtons(["save-edit-entry"]);
        messageEditEntryExists.classList.remove("hide");
      }
      // The question does not already exist.
      else {
        var answerLength = getById('edit-entry-answer').value.length;
        if (0 < answerLength && answerLength <= 80) {
          enableButtons([["save-edit-entry", saveEditEntry]]);
        }
        messageEditEntryExists.classList.add("hide");
      }
    }

    var prior = getById("edit-entry-question").placeholder;

    // Points the request at the appropriate command.
    request.open(
      "GET", "/create/entry_already_exists?question="
      + encodeURIComponent(question) + "&prior=" + encodeURIComponent(prior),
      true
    );

    // Sends the request off.
    request.send();
  }
}

function changeEditEntryAnswer() {
  var answer = getById("edit-entry-answer").value;
  var messageEditEntryEmpty = getById("message-edit-entry-empty-answer");
  var messageEditEntryLong = getById("message-edit-entry-long-answer");

  if (answer == "" || answer.length > 80) {
    if (answer == "") {
      messageEditEntryEmpty.classList.remove("hide");
      messageEditEntryLong.classList.add("hide");
    }
    else {
      messageEditEntryEmpty.classList.add("hide");
      messageEditEntryLong.classList.remove("hide");
    }
    disableButtons(["save-edit-entry"]);
  }
  else {
    messageEditEntryEmpty.classList.add("hide");
    messageEditEntryLong.classList.add("hide");
    var problems = document.querySelectorAll(
      "edit-entry-question-div>span:not(.hide)"
    );
    if (
      problems.length == 0 && getById("edit-entry-question").value.length > 0
    ) {
      enableButtons([["save-edit-entry", saveEditEntry]]);
    }
  }
}

function editEntryAddRow() {
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
  newLeftColumn.onclick = function () {
    editEntryPromoteAnswer(this);
  };

  var newTrashButton = document.createElement("button");
  newTrashButton.innerHTML = "🗑️";
  newTrashButton.classList.add("trash-can");
  newTrashButton.onclick = function () {
    trashRow(this);
  };

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

function trashRow(button) {
  button.parentNode.parentNode.remove();
}

function editEntryHitEnterAnotherAnswer(event) {
  if (event.key == "Enter") {
    editEntryAddRow();
  }
}

function editEntryPromoteAnswer(promoteCell) {
  var formerTopAnswerInput = getById("edit-entry-answer");
  var formerTopAnswer = formerTopAnswerInput.value;
  formerTopAnswerInput.value = promoteCell.innerHTML;
  if (formerTopAnswer == "") {
    promoteCell.parentNode.remove();
    getById("message-edit-entry-empty-answer").classList.add("hide");
  }
  else {
    promoteCell.innerHTML = formerTopAnswer;
  }
}

function saveEditEntry() {
  var questionEntry = getById("edit-entry-question");
  var prior = questionEntry.placeholder;
  var question = questionEntry.value;
  var answer = getById("edit-entry-answer").value;
  var moreAnswersCells = document.querySelectorAll(
    "#edit-entry-answers-table>tbody>tr:not(:last-child)>td:first-child"
  );
  var moreAnswers = [];
  for (var i = 0; i < moreAnswersCells.length; i ++) {
    moreAnswers.push(moreAnswersCells[i].innerHTML);
  }
  var moreAnswersString = JSON.stringify(moreAnswers);

  var hiddenRows = getById("edit-entry-sheet-table-hidden-rows").children;
  var parentSheets = [];
  for (var i = 0; i < hiddenRows.length; i ++) {
    parentSheets.push(hiddenRows[i].innerHTML);
  }
  var parentSheetsString = JSON.stringify(parentSheets);

  var request = new XMLHttpRequest();

  request.onload = function() {
    var already_there = JSON.parse(request.responseText)['already_there'];
    if (already_there) {
      alert("Sheet already made!");
    }
    else {
      hideEditEntryInterface();
      searchAll();
    }
  }

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/edit_entry?question=" + encodeURIComponent(question)
    + "&prior=" + encodeURIComponent(prior)
    + "&answer=" + encodeURIComponent(answer)
    + "&moreAnswers=" + encodeURIComponent(moreAnswersString)
    + "&sheets=" + encodeURIComponent(parentSheetsString), true
  );

  // Sends the request off.
  request.send();
}

function clickEditEntrySheet(entry) {
  if (entry.classList.contains('selected-row')) {
    entry.classList.remove('selected-row');
    var checkRows = getById('edit-entry-sheet-table-hidden-rows').children
    for (var i = 0; i < checkRows.length; i ++) {
      if (checkRows[i].innerHTML == entry.firstChild.innerHTML) {
        checkRows[i].remove();
      }
    }
  }
  else {
    entry.classList.add('selected-row');
    var newRow = getById('edit-entry-sheet-table-hidden-rows').insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function editEntryLoadMoreSheets(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    rowsElement = getById('edit-entry-sheet-table-rows');
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
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickEditEntrySheet(this);
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
    var loadMoreRow = getById('edit-entry-sheet-load-more-row');
    if (returnJSON['more_sheets'] == true) {
        loadMoreRow.style.visibility = 'visible';
    }
    else {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  numberAlready = document.querySelectorAll(
    "#edit-entry-sheet-table-rows>tr"
  ).length

  // Finds the search query
  query = getById("edit-entry-search-sheets").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/load_more_sheets?already=" + numberAlready
    + "&query=" + encodeURIComponent(query), true
  );

  // Sends the request off.
  request.send();
}

function editEntrySearchSheets() {
 // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  request.onload = function() {
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
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickEditEntrySheet(this);
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

    var loadMoreRow = getById('edit-entry-sheet-load-more-row');
    if (returnJSON['more_sheets'] == true) {
        loadMoreRow.style.visibility = 'visible';
    }
    else {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  // Finds the search query
  query = getById("edit-entry-search-sheets").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/search?query=" + encodeURIComponent(query)
    + "&sheets=1&entries=0", true
  );

  // Sends the request off.
  request.send();
}
