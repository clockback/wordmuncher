function searchAll() {
  // Finds the search query
  query = getById("search-all").value;

  // Sends a search request.
  openRequest("/create/search", [
    ["query", query], ["sheets", 1], ["entries", 1]
  ], processSearchAll);
}

function processSearchAll(request) {
  var returnJSON = JSON.parse(request.responseText);

  var sheetTableRows = getById('sheet-table-rows');
  sheetTableRows.innerHTML = "";

  for (var i = 0; i < returnJSON['sheets'].length; i ++) {
    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickSheet(this);
    };

    for (var j = 0; j < 3; j ++) {
      var newCell = document.createElement("td");
      newCell.innerHTML = returnJSON['sheets'][i][j];
      newRow.appendChild(newCell);
    }
    sheetTableRows.appendChild(newRow);
  }

  var entryTableRows = getById('entry-table-rows');
  entryTableRows.innerHTML = "";

  for (var i = 0; i < returnJSON['entries'].length; i ++) {
    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickEntry(this);
    };

    for (var j = 0; j < 4; j ++) {
      var newCell = document.createElement("td");
      newCell.innerHTML = returnJSON['entries'][i][j];
      newRow.appendChild(newCell);
    }
    entryTableRows.appendChild(newRow);
  }

  var loadMoreSheetsBtn = getById('sheet-load-more-row');
  var loadMoreEntriesBtn = getById('entry-load-more-row');

  if (returnJSON['more_sheets'] == true) {
    loadMoreSheetsBtn.style.visibility = 'visible';
  }
  else {
    loadMoreSheetsBtn.style.visibility = 'collapse';
  }

  if (returnJSON['more_entries'] == true) {
    loadMoreEntriesBtn.style.visibility = 'visible';
  }
  else {
    loadMoreEntriesBtn.style.visibility = 'collapse';
  }

  disableButtons(["edit-sheet", "delete-sheet", "edit-entry", "delete-entry"]);
}

function loadMoreSheets(numberAlready) {
  numberAlready = document.querySelectorAll("#sheet-table-rows>tr").length;

  // Finds the search query
  query = getById("search-all").value;

  openRequest("/create/load_more_sheets", [
    ["already", numberAlready], ["query", query]
  ], processLoadMoreSheets);
}

function processLoadMoreSheets(request) {
  var returnJSON = JSON.parse(request.responseText);
  var rowsElement = getById('sheet-table-rows');

  for (var i = 0; i < returnJSON["sheets"].length; i ++) {
    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickSheet(this);
    }

    for (var j = 0; j < 3; j++) {
      var cell = document.createElement("td");
      cell.innerHTML = returnJSON["sheets"][i][j];
      newRow.appendChild(cell);
    }
    rowsElement.appendChild(newRow);
  }
  var loadMoreRow = getById('sheet-load-more-row');
  if (returnJSON['more_sheets'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function loadMoreEntries(numberAlready) {
  // Finds the number of entries already loaded.
  numberAlready = document.querySelectorAll("#entry-table-rows>tr").length

  // Finds the search query
  query = getById("search-all").value;

  openRequest("/create/load_more_entries", [
    ["already", numberAlready], ["query", query]
  ], processLoadMoreEntries);
}

function processLoadMoreEntries(request) {
  var returnJSON = JSON.parse(request.responseText);
  rowsElement = getById('entry-table-rows');

  for (var i = 0; i < returnJSON['entries'].length; i ++) {
    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      clickEntry(this);
    }

    for (var j = 0; j < 4; j++) {
      var cell = document.createElement("td");
      cell.innerHTML = returnJSON["entries"][i][j];
      newRow.appendChild(cell);
    }
    rowsElement.appendChild(newRow);
  }
  var loadMoreRow = getById('entry-load-more-row');
  if (returnJSON['more_entries'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function clickSheet(toSelect) {
  selectedRows = document.querySelectorAll("#sheet-table-rows>.selected-row");

  var found = false;
  for (var i = 0; i < selectedRows.length; i++) {
    selectedRows[i].classList.remove("selected-row");
    if (selectedRows[i] == toSelect) {
      found = true;
    }
  }

  if (!found) {
    toSelect.classList.add("selected-row");

    enableButtons([
      ["edit-sheet", function () {
        showEditSheetInterface(toSelect.children[0].innerHTML);
      }],
      ["delete-sheet", deleteSheet]
    ]);
  }
  else {
    disableButtons(["edit-sheet", "delete-sheet"]);
  }
}

function clickEntry(toSelect) {
  var selectedRows = document.querySelectorAll(
    "#entry-table-rows>.selected-row"
  );

  var found = false;
  for (var i = 0; i < selectedRows.length; i++) {
    selectedRows[i].classList.remove("selected-row");
    if (selectedRows[i] == toSelect) {
      found = true;
    }
  }

  if (!found) {
    toSelect.classList.add("selected-row");

    enableButtons([
      ["edit-entry", function () {
        showEditEntryInterface(toSelect.children[0].innerHTML)
      }],
      ["delete-entry", deleteEntry]
    ]);
  }
  else {
    disableButtons(["edit-entry", "delete-entry"]);
  }
}

function deleteSheet() {
  // Finds the row to be deleted.
  var rowToDelete = document.querySelector(
    "#sheet-table-rows>.selected-row"
  );

  // Finds the name of the row to be deleted.
  var nameToDelete = rowToDelete.querySelector("td:first-child").innerHTML;

  openRequest("/create/delete_sheet", [
    ["sheet", nameToDelete]
  ], processDeleteSheet, rowToDelete);
}

function processDeleteSheet(request, rowToDelete) {
  var returnJSON = JSON.parse(request.responseText);

  disableButtons(["edit-sheet", "delete-sheet"]);

  rowToDelete.remove();

  // Allows each of the rows to be clicked.
  var children = document.querySelectorAll("#sheet-table-rows>tr");
  for (var i = 0; i < children.length; i++) {
    children[i].onclick = function () {
      clickSheet(this);
    };
  }

  // Updates corresponding rows in entry table.
  var entryRows = document.querySelectorAll("#entry-table-rows>tr");
  for (var i = 0; i < entryRows.length; i ++) {
    for (var j = 0; j < returnJSON["entries"].length; j ++) {
      if (returnJSON["entries"][j] == entryRows[i].children[0].innerHTML) {
        var noMentions = Number(entryRows[i].children[2].innerHTML) - 1;
        entryRows[i].children[2].innerHTML = noMentions.toString();
        break;
      }
    }
  }
}

function deleteEntry() {
  // Finds the row to be deleted.
  var rowToDelete = document.querySelector(
    "#entry-table-rows>.selected-row"
  );

  // Finds the name of the row to be deleted.
  var nameToDelete = rowToDelete.querySelector("td:first-child").innerHTML;

  openRequest("/create/delete_entry", [
    ["entry", nameToDelete]
  ], processDeleteEntry, rowToDelete);
}

function processDeleteEntry(request, rowToDelete) {
  var returnJSON = JSON.parse(request.responseText);

  disableButtons(["edit-entry", "delete-entry"]);

  rowToDelete.remove();

  // Allows each of the rows to be clicked.
  var children = document.querySelectorAll("#entry-table-rows>tr");
  for (var i = 0; i < children.length; i++) {
    children[i].onclick = function () {
      clickEntry(this);
    };
  }

  // Updates corresponding rows in entry table.
  var sheetRows = document.querySelectorAll("#sheet-table-rows>tr");
  for (var i = 0; i < sheetRows.length; i ++) {
    for (var j = 0; j < returnJSON["sheets"].length; j ++) {
      if (returnJSON["sheets"][j] == sheetRows[i].children[0].innerHTML) {
        var noMentions = Number(sheetRows[i].children[2].innerHTML) - 1;
        sheetRows[i].children[2].innerHTML = noMentions.toString();
        break;
      }
    }
  }
}
