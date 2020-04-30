function searchAll() {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);

    var sheetTableRows = document.getElementById('sheet-table-rows');
    sheetTableRows.innerHTML = "";

    for (var i = 0; i < returnJSON['sheets'].length; i ++)
    {
      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickSheet(this);
      };

      for (var j = 0; j < 3; j ++)
      {
        var newCell = document.createElement("td");
        newCell.innerHTML = returnJSON['sheets'][i][j];
        newRow.appendChild(newCell);
      }
      sheetTableRows.appendChild(newRow);
    }

    var entryTableRows = document.getElementById('entry-table-rows');
    entryTableRows.innerHTML = "";

    for (var i = 0; i < returnJSON['entries'].length; i ++)
    {
      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickEntry(this);
      };

      for (var j = 0; j < 4; j ++)
      {
        var newCell = document.createElement("td");
        newCell.innerHTML = returnJSON['entries'][i][j];
        newRow.appendChild(newCell);
      }
      entryTableRows.appendChild(newRow);
    }

    var loadMoreSheetsBtn = document.getElementById('sheet-load-more-row');
    var loadMoreEntriesBtn = document.getElementById('entry-load-more-row');

    if (returnJSON['more_sheets'] == true)
    {
        loadMoreSheetsBtn.style.visibility = 'visible';
    }
    else
    {
        loadMoreSheetsBtn.style.visibility = 'collapse';
    }

    if (returnJSON['more_entries'] == true)
    {
        loadMoreEntriesBtn.style.visibility = 'visible';
    }
    else
    {
        loadMoreEntriesBtn.style.visibility = 'collapse';
    }

    var editSheetButton = document.getElementById("edit-sheet");
    var deleteSheetButton = document.getElementById("delete-sheet");
    var editEntryButton = document.getElementById("edit-entry");
    var deleteEntryButton = document.getElementById("delete-entry");

    editSheetButton.classList.add("button-disabled");
    editSheetButton.onclick = "";
    deleteSheetButton.classList.add("button-disabled");
    deleteSheetButton.onclick = "";
    editEntryButton.classList.add("button-disabled");
    editEntryButton.onclick = "";
    deleteEntryButton.classList.add("button-disabled");
    deleteEntryButton.onclick = "";
  };

  // Finds the search query
  query = document.getElementById("search-all").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/search?query=" + encodeURIComponent(query)
    + "&sheets=1&entries=1", true
  );

  // Sends the request off.
  request.send();
}

function loadMoreSheets(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    var rowsElement = document.getElementById('sheet-table-rows');

    for (var i = 0; i < returnJSON["sheets"].length; i ++)
    {
      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickSheet(this);
      }

      for (var j = 0; j < 3; j++)
      {
        var cell = document.createElement("td");
        cell.innerHTML = returnJSON["sheets"][i][j];
        newRow.appendChild(cell);
      }
      rowsElement.appendChild(newRow);
    }
    var loadMoreRow = document.getElementById('sheet-load-more-row');
    if (returnJSON['more_sheets'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  numberAlready = document.querySelectorAll("#sheet-table-rows>tr").length

  // Finds the search query
  query = document.getElementById("search-all").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/load_more_sheets?already=" + numberAlready
    + "&query=" + encodeURIComponent(query), true
  );

  // Sends the request off.
  request.send();
}

function loadMoreEntries(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    rowsElement = document.getElementById('entry-table-rows');

    for (var i = 0; i < returnJSON['entries'].length; i ++)
    {
      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickEntry(this);
      }

      for (var j = 0; j < 4; j++)
      {
        var cell = document.createElement("td");
        cell.innerHTML = returnJSON["entries"][i][j];
        newRow.appendChild(cell);
      }
      rowsElement.appendChild(newRow);
    }
    var loadMoreRow = document.getElementById('entry-load-more-row');
    if (returnJSON['more_entries'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  numberAlready = document.querySelectorAll("#entry-table-rows>tr").length

  // Finds the search query
  query = document.getElementById("search-all").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/load_more_entries?already=" + numberAlready
    + "&query=" + encodeURIComponent(query), true
  );

  // Sends the request off.
  request.send();
}

function clickSheet(toSelect) {
  selectedRows = document.querySelectorAll("#sheet-table-rows>.selected-row");

  var found = false;
  for (var i = 0; i < selectedRows.length; i++)
  {
    selectedRows[i].classList.remove("selected-row");
    if (selectedRows[i] == toSelect)
    {
      found = true;
    }
  }

  var editButton = document.getElementById("edit-sheet");
  var deleteButton = document.getElementById("delete-sheet");
  if (!found)
  {
    toSelect.classList.add("selected-row");

    editButton.classList.remove("button-disabled");
    editButton.onclick = function () {
      showEditSheetInterface(toSelect.children[0].innerHTML);
    }

    deleteButton.classList.remove("button-disabled");
    deleteButton.onclick = deleteSheet;
  }
  else
  {
    editButton.classList.add("button-disabled");
    editButton.onclick = "";
    deleteButton.classList.add("button-disabled");
    deleteButton.onclick = "";
  }
}

function clickEntry(toSelect) {
  selectedRows = document.querySelectorAll("#entry-table-rows>.selected-row");

  var found = false;
  for (var i = 0; i < selectedRows.length; i++)
  {
    selectedRows[i].classList.remove("selected-row");
    if (selectedRows[i] == toSelect)
    {
      found = true;
    }
  }

  var editButton = document.getElementById("edit-entry");
  var deleteButton = document.getElementById("delete-entry");
  if (!found)
  {
    toSelect.classList.add("selected-row");

    editButton.classList.remove("button-disabled");
    editButton.onclick = function () {
      showEditEntryInterface(toSelect.children[0].innerHTML);
    }
    deleteButton.classList.remove("button-disabled");
    deleteButton.onclick = deleteEntry;
  }
  else
  {
    var editButton = document.getElementById("edit-entry");
    editButton.classList.add("button-disabled");
    editButton.onclick = "";
    deleteButton.classList.add("button-disabled");
    deleteButton.onclick = "";
  }
}

function deleteSheet() {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Finds the row to be deleted.
  var rowToDelete = document.querySelector(
    "#sheet-table-rows>.selected-row"
  );

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);

    var editButton = document.getElementById("edit-sheet");
    editButton.classList.add("button-disabled");
    editButton.onclick = "";
    var deleteButton = document.getElementById("delete-sheet");
    deleteButton.classList.add("button-disabled");
    deleteButton.onclick = "";
    rowToDelete.parentNode.removeChild(rowToDelete);

    // Allows each of the rows to be clicked.
    var children = document.querySelectorAll("#sheet-table-rows>tr");
    for (var i = 0; i < children.length; i++)
    {
      children[i].onclick = function () {
        clickSheet(this);
      };
    }

    // Updates corresponding rows in entry table.
    var entryRows = document.querySelectorAll("#entry-table-rows>tr");
    for (var i = 0; i < entryRows.length; i ++)
    {
      for (var j = 0; j < returnJSON["entries"].length; j ++)
      {
        if (returnJSON["entries"][j] == entryRows[i].children[0].innerHTML)
        {
          var noMentions = Number(entryRows[i].children[2].innerHTML) - 1;
          entryRows[i].children[2].innerHTML = noMentions.toString();
          break;
        }
      }
    }
  };

  // Finds the name of the row to be deleted.
  var nameToDelete = rowToDelete.querySelector("td:first-child").innerHTML;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/delete_sheet?sheet=" + encodeURIComponent(nameToDelete),
    true
  );

  // Sends the request off.
  request.send();
}

function deleteEntry() {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Finds the row to be deleted.
  var rowToDelete = document.querySelector(
    "#entry-table-rows>.selected-row"
  );

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);

    var editButton = document.getElementById("edit-entry");
    editButton.classList.add("button-disabled");
    editButton.onclick = "";

    var deleteButton = document.getElementById("delete-entry");
    deleteButton.classList.add("button-disabled");
    deleteButton.onclick = "";

    rowToDelete.parentNode.removeChild(rowToDelete);

    // Allows each of the rows to be clicked.
    var children = document.querySelectorAll("#entry-table-rows>tr");
    for (var i = 0; i < children.length; i++)
    {
      children[i].onclick = function () {
        clickEntry(this);
      };
    }

    // Updates corresponding rows in entry table.
    var sheetRows = document.querySelectorAll("#sheet-table-rows>tr");
    for (var i = 0; i < sheetRows.length; i ++)
    {
      for (var j = 0; j < returnJSON["sheets"].length; j ++)
      {
        if (returnJSON["sheets"][j] == sheetRows[i].children[0].innerHTML)
        {
          var noMentions = Number(sheetRows[i].children[2].innerHTML) - 1;
          sheetRows[i].children[2].innerHTML = noMentions.toString();
          break;
        }
      }
    }
  };

  // Finds the name of the row to be deleted.
  var nameToDelete = rowToDelete.querySelector("td:first-child").innerHTML;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/delete_entry?entry=" + encodeURIComponent(nameToDelete),
    true
  );

  // Sends the request off.
  request.send();
}
