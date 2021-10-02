function showEditSheetInterface(name) {
  hide([
    "message-edit-sheet-already-exists", "message-edit-sheet-empty-name",
    "message-edit-sheet-long-name"
  ]);

  disallowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  editSheetSearchEntries();

  enableButtons([["save-edit-sheet", saveEditSheet]]);

  unhide(['edit-sheet-container-background'])
  var editSheetNameEntry = getById('edit-sheet-name');
  editSheetNameEntry.value = name;
  editSheetNameEntry.placeholder = name;
  editSheetNameEntry.focus();

  openRequest("/create/extant_entries", [
    ["sheet", name]
  ], processShowEditSheetInterface);
}

function processShowEditSheetInterface(request) {
  var returnJSON = JSON.parse(request.responseText);
  var entries = returnJSON["entries"];
  var hiddenRows = getById("edit-sheet-entry-table-hidden-rows");
  var visibleRows = getById("edit-sheet-entry-table-rows").children;

  for (var i = 0; i < entries.length; i ++) {
    var hiddenRow = document.createElement("tr");
    hiddenRow.innerHTML = entries[i];
    hiddenRows.appendChild(hiddenRow);

    for (var j = 0; j < visibleRows.length; j ++) {
      if (visibleRows[j].children[0].innerHTML == entries[i]) {
        visibleRows[j].classList.add("selected-row");
        break;
      }
    }
  }
}

function hideEditSheetInterface() {
  allowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  hide(['edit-sheet-container-background']);
  getById('edit-sheet-name').value = "";
  getById('edit-sheet-search-entries').value = "";
  getById('edit-sheet-entry-table-hidden-rows').innerHTML = "";
}

function changeEditSheetName() {
  var name = getById("edit-sheet-name").value;

  if (name == "" || name.length > 80) {
    if (name == "") {
      unhide(["message-edit-sheet-empty-name"]);
      hide([
        "message-edit-sheet-long-name", "message-edit-sheet-already-exists"
      ]);
    }
    else {
      hide([
        "message-edit-sheet-empty-name", "message-edit-sheet-already-exists"
      ]);
      unhide(["message-edit-sheet-long-name"]);
    }
    disableButtons(["save-edit-sheet"]);
  }
  else {
    hide(["message-edit-sheet-empty-name", "message-edit-sheet-long-name"]);
    var prior = getById("edit-sheet-name").placeholder;

    openRequest("/sheet_already_exists", [
      ["name", name], ["prior", prior]
    ], processChangeEditSheetName);
  }
}

function processChangeEditSheetName(request) {
  var result = JSON.parse(request.responseText)['already_there'];

  if (result) {
    disableButtons(["save-edit-sheet"]);
    unhide(["message-edit-sheet-already-exists"])
  }
  else {
    enableButtons([["save-edit-sheet", saveEditSheet]]);
    hide(["message-edit-sheet-already-exists"]);
  }
}

function saveEditSheet() {
 // Gets the name of the new sheet.
  var sheetName = getById('edit-sheet-name').value;

  var hiddenRows = getById("edit-sheet-entry-table-hidden-rows").children;
  var childEntries = [];
  for (var i = 0; i < hiddenRows.length; i ++) {
    childEntries.push(hiddenRows[i].innerHTML);
  }
  var childEntriesString = JSON.stringify(childEntries);

  var prior = getById("edit-sheet-name").placeholder;

  openRequest("/create/edit_sheet", [
    ["name", sheetName], ["prior", prior], ["entries", childEntriesString]
  ], processSaveEditSheet);
}

function processSaveEditSheet(request) {
  var already_there = JSON.parse(request.responseText)['already_there'];
  if (already_there) {
    alert("Sheet already made!");
  }
  else {
    hideEditSheetInterface();
    searchAll();
  }
}

function keyDownOnEditSheetContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideEditSheetInterface();
  }
}

function clickEditSheetEntry(entry) {
  if (entry.classList.contains('selected-row')) {
    entry.classList.remove('selected-row');
    var checkRows = getById('edit-sheet-entry-table-hidden-rows').children
    for (var i = 0; i < checkRows.length; i ++) {
      if (checkRows[i].innerHTML == entry.firstElementChild.innerHTML) {
        checkRows[i].remove();
      }
    }
  }
  else {
    entry.classList.add('selected-row');
    var newRow = getById('edit-sheet-entry-table-hidden-rows').insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function editSheetLoadMoreEntries(numberAlready) {
  numberAlready = document.querySelectorAll(
    "#edit-sheet-entry-table-rows>tr"
  ).length

  // Finds the search query
  query = getById("edit-sheet-search-entries").value;

  openRequest("/create/load_more_entries", [
    ["already", numberAlready], ["query", query]
  ], processEditSheetLoadMoreEntries);
}

function processEditSheetLoadMoreEntries(request) {
  var returnJSON = JSON.parse(request.responseText);
  rowsElement = getById('edit-sheet-entry-table-rows');
  var possibleMatches = getById(
    "edit-sheet-entry-table-hidden-rows"
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
    newRow.setAttribute("tabindex", "0");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickEditSheetEntry(this);
    }
    bindButtonKeyPressEvents(newRow, clickEditSheetEntry);

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
  var loadMoreRow = getById('edit-sheet-entry-load-more-row');
  if (returnJSON['more_entries'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function editSheetSearchEntries() {
  // Finds the search query
  query = getById("edit-sheet-search-entries").value;

  openRequest("/create/search", [
    ["query", query], ["sheets", 0], ["entries", 1]
  ], processEditSheetSearchEntries);
}

function processEditSheetSearchEntries(request) {
  var returnJSON = JSON.parse(request.responseText);
  var rowsElement = getById('edit-sheet-entry-table-rows');
  rowsElement.innerHTML = "";
  var possibleMatches = getById(
    "edit-sheet-entry-table-hidden-rows"
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
    newRow.setAttribute("tabindex", "0");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickEditSheetEntry(this);
    }
    bindButtonKeyPressEvents(newRow, clickEditSheetEntry);

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

  var loadMoreRow = getById('edit-sheet-entry-load-more-row');
  if (returnJSON['more_entries'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}
