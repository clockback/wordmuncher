function showNewSheetInterface() {
  hide([
    "message-new-sheet-already-exists", "message-new-sheet-empty-name",
    "message-new-sheet-long-name"
  ]);

  disallowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);
  newSheetSearchEntries();

  disableButtons(["save-new-sheet"]);

  unhide(["add-sheet-container-background"])
  getById('new-sheet-name').focus();
}

function hideNewSheetInterface() {
  hide(["add-sheet-container-background"]);

  allowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  getById('new-sheet-name').value = "";
  getById('new-sheet-search-entries').value = "";
  getById('new-sheet-entry-table-hidden-rows').innerHTML = "";
}

function changeNewSheetName() {
  var name = getById("new-sheet-name").value;

  if (name == "" || name.length > 80) {
    if (name == "") {
      unhide(["message-new-sheet-empty-name"]);
      hide(
        ["message-new-sheet-long-name", "message-new-sheet-already-exists"]
      );
    }
    else {
      hide(
        ["message-new-sheet-empty-name"], "message-new-sheet-already-exists"
      );
      unhide(["message-new-sheet-long-name"]);
    }
    disableButtons(["save-new-sheet"]);
  }
  else {
    hide(["message-new-sheet-empty-name", "message-new-sheet-long-name"]);
    openRequest("/sheet_already_exists", [
      ["name", name]
    ], processChangeNewSheetName);
  }
}

function processChangeNewSheetName(request) {
  var result = JSON.parse(request.responseText)['already_there'];
  if (result) {
    disableButtons(["save-new-sheet"]);
    unhide(["message-new-sheet-already-exists"]);
  }
  else {
    enableButtons([["save-new-sheet", saveNewSheet]]);
    hide(["message-new-sheet-already-exists"]);
  }
}

function saveNewSheet() {
  // Gets the name of the new sheet.
  var sheetName = getById('new-sheet-name').value;

  var hiddenRows = getById("new-sheet-entry-table-hidden-rows").children;
  var childEntries = [];
  for (var i = 0; i < hiddenRows.length; i ++) {
    childEntries.push(hiddenRows[i].innerHTML);
  }
  var childEntriesString = JSON.stringify(childEntries);

  openRequest("/create/new_sheet", [
    ["name", sheetName], ["entries", childEntriesString]
  ], processSaveNewSheet);
}

function processSaveNewSheet(request) {
  var already_there = JSON.parse(request.responseText)['already_there'];
  if (already_there) {
    alert("Sheet already made!");
  }
  else {
    hideNewSheetInterface();
    searchAll();
  }
}

function keyDownOnNewSheetContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideNewSheetInterface();
  }
}

function clickNewSheetEntry(entry) {
  if (entry.classList.contains('selected-row')) {
    entry.classList.remove('selected-row');
    var checkRows = getById('new-sheet-entry-table-hidden-rows').children
    for (var i = 0; i < checkRows.length; i ++) {
      if (checkRows[i].innerHTML == entry.firstElementChild.innerHTML) {
        checkRows[i].remove();
      }
    }
  }
  else {
    entry.classList.add('selected-row');
    var newRow = getById('new-sheet-entry-table-hidden-rows').insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function newSheetLoadMoreEntries(numberAlready) {
  numberAlready = document.querySelectorAll(
    "#add-sheet-entry-table-rows>tr"
  ).length

  // Finds the search query
  query = getById("new-sheet-search-entries").value;

  openRequest("/create/load_more_entries", [
    ["already", numberAlready], ["query", query]
  ], processNewSheetLoadMoreEntries);
}

function processNewSheetLoadMoreEntries(request) {
  var returnJSON = JSON.parse(request.responseText);
  rowsElement = getById('add-sheet-entry-table-rows');
  var possibleMatches = getById(
    "new-sheet-entry-table-hidden-rows"
  ).children;

  for (var i = 0; i < returnJSON['entries'].length; i ++) {
    var foundHidden = false;
    for (var j = 0; j < possibleMatches.length; j++) {
      if (possibleMatches[j].innerHTML == returnJSON["entries"][i][0]) {
        foundHidden = true;
        break;
      }
    }

    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickNewSheetEntry(this);
    }

    for (var j = 0; j < 4; j ++) {
      var cell = document.createElement("td");
      cell.innerHTML = returnJSON["entries"][i][j];
      newRow.appendChild(cell);
    }

    rowsElement.appendChild(newRow);

    if (foundHidden) {
      newRow.classList.add("selected-row");
    }
  }
  var loadMoreRow = getById('new-sheet-entry-load-more-row');
  if (returnJSON['more_entries'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function newSheetSearchEntries() {
  // Finds the search query
  query = getById("new-sheet-search-entries").value;

  openRequest("/create/search", [
    ["query", query], ["sheets", 0], ["entries", 1]
  ], processNewSheetSearchEntries);
}

function processNewSheetSearchEntries(request) {
  var returnJSON = JSON.parse(request.responseText);
  var rowsElement = getById('add-sheet-entry-table-rows');
  rowsElement.innerHTML = "";
  var possibleMatches = getById(
    "new-sheet-entry-table-hidden-rows"
  ).children;
  for (var i = 0; i < returnJSON["entries"].length; i ++) {
    var foundHidden = false;
    for (var j = 0; j < possibleMatches.length; j++) {
      if (possibleMatches[j].innerHTML == returnJSON["entries"][i][0]) {
        foundHidden = true;
        break;
      }
    }

    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickNewSheetEntry(this);
    }

    for (var j = 0; j < 4; j ++) {
      var cell = document.createElement("td");
      cell.innerHTML = returnJSON["entries"][i][j];
      newRow.appendChild(cell);
    }

    rowsElement.appendChild(newRow);

    if (foundHidden) {
      newRow.classList.add("selected-row");
    }
  }

  var loadMoreRow = getById('new-sheet-entry-load-more-row');
  if (returnJSON['more_entries'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}
