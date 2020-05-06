function searchSheets(numberAlready) {
  // Finds the current search query.
  var query = getById('search-sheets').value;

  openRequest("/test/search", [["query", query]], processSearchSheets);
}

function processSearchSheets(request) {
  var returnJSON = JSON.parse(request.responseText);

  var sheetTableRows = getById('sheet-table-rows');
  sheetTableRows.innerHTML = "";

  for (var i = 0; i < returnJSON['sheets'].length; i ++) {
    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      testSheet(this);
    };

    for (var j = 0; j < 3; j ++) {
      var newCell = document.createElement("td");
      newCell.innerHTML = returnJSON['sheets'][i][j];
      newRow.appendChild(newCell);
    }
    sheetTableRows.appendChild(newRow);
  }

  var loadMoreRow = getById('load-more-row');
  if (returnJSON['more_sheets'] == true) {
    loadMoreRow.style.visibility = 'visible';
  }
  else {
    loadMoreRow.style.visibility = 'collapse';
  }
}

function loadMoreSheets() {
  // Finds the current search query.
  var query = getById('search-sheets').value;

  // Finds the number of entries already
  var already = getById('sheet-table-rows').children.length;

  openRequest("/test/load_more_sheets", [
    ["query", query], ["already", already]
  ], processLoadMoreSheets);
}

function processLoadMoreSheets(request) {
  var returnJSON = JSON.parse(request.responseText);

  var sheetTableRows = getById('sheet-table-rows');
  for (var i = 0; i < returnJSON['sheets'].length; i ++) {
    var newRow = document.createElement("tr");
    newRow.style["cursor"] = "pointer";
    newRow.onclick = function () {
      testSheet(this);
    };

    for (var j = 0; j < 3; j ++) {
      var newCell = document.createElement("td");
      newCell.innerHTML = returnJSON['sheets'][i][j];
      newRow.appendChild(newCell);
    }
    sheetTableRows.appendChild(newRow);
  }

  var loadMoreRow = getById('load-more-row');
  if (returnJSON['more_sheets'] == true) {
      loadMoreRow.style.visibility = 'visible';
  }
  else {
      loadMoreRow.style.visibility = 'collapse';
  }
}