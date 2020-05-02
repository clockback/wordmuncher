function showNewEntryInterface() {
  disallowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  newEntrySearchSheets();
  getById('add-entry-container-background').classList.remove('hide');
  getById('new-entry-question').focus();
}

function hideNewEntryInterface() {
  allowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  getById('add-entry-container-background').classList.add('hide');
  getById('new-entry-question').value = "";
  getById('new-entry-answer').value = "";
  getById('new-entry-search-sheets').value = "";
  getById('new-entry-add-answer').value = "";

  var moreAnswers = document.querySelectorAll(
    "#new-entry-answers-table>tbody>tr:not(:last-child)"
  );
  for (var i = 0; i < moreAnswers.length; i ++)
  {
    moreAnswers[i].remove();
  }

  var warnings = document.querySelectorAll(
    "#new-entry-question-div>span,#new-entry-answer-div>span"
  );
  for (var i = 0; i < warnings.length; i ++)
  {
    warnings[i].classList.add("hide");
  }

  disableButtons(["save-new-entry"]);

  getById('new-entry-sheet-table-hidden-rows').innerHTML = "";
}

function keyDownOnNewEntryContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape")
  {
    hideNewEntryInterface();
  }
}

function changeNewEntryQuestion() {
  var question = getById("new-entry-question").value;
  var messageNewEntryExists = getById("message-new-entry-already-exists");
  var messageNewEntryEmpty = getById("message-new-entry-empty-question");
  var messageNewEntryLong = getById("message-new-entry-long-question");

  if (question == "" || question.length > 80)
  {
    if (question == "")
    {
      messageNewEntryEmpty.classList.remove("hide");
      messageNewEntryLong.classList.add("hide");
    }
    else
    {
      messageNewEntryEmpty.classList.add("hide");
      messageNewEntryLong.classList.remove("hide");
    }
    disableButtons(["save-new-entry"]);
    messageNewEntryExists.classList.add("hide");
  }
  else
  {
    messageNewEntryEmpty.classList.add("hide");
    messageNewEntryLong.classList.add("hide");
    var request = new XMLHttpRequest();

    request.onload = function() {
      var result = JSON.parse(request.responseText)['already_there'];
      if (result)
      {
        disableButtons(["save-new-entry"]);
        messageNewEntryExists.classList.remove("hide");
      }
      // The question does not already exist.
      else
      {
        var answerLength = getById('new-entry-answer').value.length;
        if (0 < answerLength && answerLength <= 80)
        {
          enableButtons([["save-new-entry", saveNewEntry]]);
        }
        messageNewEntryExists.classList.add("hide");
      }
    }

    // Points the request at the appropriate command.
    request.open(
      "GET", "/create/entry_already_exists?question="
      + encodeURIComponent(question), true
    );

    // Sends the request off.
    request.send();
  }
}

function changeNewEntryAnswer() {
  var answer = getById("new-entry-answer").value;
  var messageNewEntryEmpty = getById("message-new-entry-empty-answer");
  var messageNewEntryLong = getById("message-new-entry-long-answer");

  if (answer == "" || answer.length > 80) {
    if (answer == "") {
      messageNewEntryEmpty.classList.remove("hide");
      messageNewEntryLong.classList.add("hide");
    }
    else {
      messageNewEntryEmpty.classList.add("hide");
      messageNewEntryLong.classList.remove("hide");
    }
    disableButtons(["save-new-entry"]);
  }
  else {
    messageNewEntryEmpty.classList.add("hide");
    messageNewEntryLong.classList.add("hide");
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

  if (mainAnswerInput.value == newAnswer)
  {
    return;
  }

  for (var i = 0; i < moreAnswersCells.length; i ++)
  {
    var anotherAnswer = moreAnswersCells[i].innerHTML;
    if (anotherAnswer == newAnswer)
    {
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
  if (event.key == "Enter")
  {
    newEntryAddRow();
  }
}

function newEntryPromoteAnswer(promoteCell) {
  var formerTopAnswerInput = getById("new-entry-answer");
  var formerTopAnswer = formerTopAnswerInput.value;
  formerTopAnswerInput.value = promoteCell.innerHTML;
  if (formerTopAnswer == "")
  {
    promoteCell.parentNode.remove();
    getById("message-new-entry-empty-answer").classList.add("hide");
  }
  else
  {
    promoteCell.innerHTML = formerTopAnswer;
  }
}

function saveNewEntry()
{
  var question = getById("new-entry-question").value;
  var answer = getById("new-entry-answer").value;
  var moreAnswersCells = document.querySelectorAll(
    "#new-entry-answers-table>tbody>tr:not(:last-child)>td:first-child"
  );
  var moreAnswers = [];
  for (var i = 0; i < moreAnswersCells.length; i ++)
  {
    moreAnswers.push(moreAnswersCells[i].innerHTML);
  }
  var moreAnswersString = JSON.stringify(moreAnswers);

  var hiddenRows = getById("new-entry-sheet-table-hidden-rows").children;
  var parentSheets = [];
  for (var i = 0; i < hiddenRows.length; i ++)
  {
    parentSheets.push(hiddenRows[i].innerHTML);
  }
  var parentSheetsString = JSON.stringify(parentSheets);

  var request = new XMLHttpRequest();

  request.onload = function() {
    hideNewEntryInterface();
    searchAll();
  }

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/new_entry?question="
    + encodeURIComponent(question) + "&answer="
    + encodeURIComponent(answer) + "&moreAnswers="
    + encodeURIComponent(moreAnswersString) + "&sheets="
    + encodeURIComponent(parentSheetsString), true
  );

  // Sends the request off.
  request.send();
}

function clickNewEntrySheet(entry) {
  if (entry.classList.contains('selected-row'))
  {
    entry.classList.remove('selected-row');
    var checkRows = getById('new-entry-sheet-table-hidden-rows').children
    for (var i = 0; i < checkRows.length; i ++)
    {
      if (checkRows[i].innerHTML == entry.firstChild.innerHTML)
      {
        checkRows[i].remove();
      }
    }
  }
  else
  {
    entry.classList.add('selected-row');
    var newRow = getById('new-entry-sheet-table-hidden-rows').insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function newEntryLoadMoreSheets(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    rowsElement = getById('add-entry-sheet-table-rows');
    var possibleMatches = getById(
      "new-entry-sheet-table-hidden-rows"
    ).children;

    for (var i = 0; i < returnJSON['sheets'].length; i ++)
    {
      var foundHidden = false;
      for (var j = 0; j < possibleMatches.length; j++)
      {
        if (possibleMatches[j].innerHTML == returnJSON["sheets"][i][0])
        {
          foundHidden = true;
          break;
        }
      }

      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickNewEntrySheet(this);
      }

      for (var j = 0; j < 3; j ++)
      {
        var cell = document.createElement("td");
        cell.innerHTML = returnJSON["sheets"][i][j];
        newRow.appendChild(cell);
      }

      rowsElement.appendChild(newRow);

      if (foundHidden)
      {
        newRow.classList.add("selected-row");
      }
    }
    var loadMoreRow = getById('new-entry-sheet-load-more-row');
    if (returnJSON['more_sheets'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  numberAlready = document.querySelectorAll(
    "#add-entry-sheet-table-rows>tr"
  ).length

  // Finds the search query
  query = getById("new-entry-search-sheets").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/load_more_sheets?already=" + numberAlready
    + "&query=" + encodeURIComponent(query), true
  );

  // Sends the request off.
  request.send();
}

function newEntrySearchSheets()
{
 // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    var rowsElement = getById('add-entry-sheet-table-rows');
    rowsElement.innerHTML = "";
    var possibleMatches = getById(
      "new-entry-sheet-table-hidden-rows"
    ).children;
    for (var i = 0; i < returnJSON["sheets"].length; i ++)
    {
      var foundHidden = false;
      for (var j = 0; j < possibleMatches.length; j++)
      {
        if (possibleMatches[j].innerHTML == returnJSON["sheets"][i][0])
        {
          foundHidden = true;
          break;
        }
      }

      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickNewEntrySheet(this);
      }

      for (var j = 0; j < 3; j ++)
      {
        var cell = document.createElement("td");
        cell.innerHTML = returnJSON["sheets"][i][j];
        newRow.appendChild(cell);
      }

      rowsElement.appendChild(newRow);

      if (foundHidden)
      {
        newRow.classList.add("selected-row");
      }
    }

    var loadMoreRow = getById('new-entry-sheet-load-more-row');
    if (returnJSON['more_sheets'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  // Finds the search query
  query = getById("new-entry-search-sheets").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/search?query=" + encodeURIComponent(query)
    + "&sheets=1&entries=0", true
  );

  // Sends the request off.
  request.send();
}
