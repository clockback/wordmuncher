function showEditSheetInterface(name) {
  getById("message-edit-sheet-already-exists").classList.add('hide');
  getById("message-edit-sheet-empty-name").classList.add('hide');
  getById("message-edit-sheet-long-name").classList.add('hide');

  disallowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  editSheetSearchEntries();

  enableButtons([["save-edit-sheet", saveEditSheet]]);

  getById('edit-sheet-container-background').classList.remove('hide');
  var editSheetNameEntry = getById('edit-sheet-name');
  editSheetNameEntry.value = name;
  editSheetNameEntry.placeholder = name;
  editSheetNameEntry.focus();

  var request = new XMLHttpRequest();

  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    var entries = returnJSON["entries"];
    var hiddenRows = getById("edit-sheet-entry-table-hidden-rows");
    var visibleRows = getById("edit-sheet-entry-table-rows").children;

    for (var i = 0; i < entries.length; i ++)
    {
      var hiddenRow = document.createElement("tr");
      hiddenRow.innerHTML = entries[i];
      hiddenRows.appendChild(hiddenRow);

      for (var j = 0; j < visibleRows.length; j ++)
      {
        if (visibleRows[j].children[0].innerHTML == entries[i])
        {
          visibleRows[j].classList.add("selected-row");
          break;
        }
      }
    }
  }

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/extant_entries?sheet=" + encodeURIComponent(name), true
  );

  // Sends the request off.
  request.send();
}

function hideEditSheetInterface() {
  allowTabSelection([
    "back", "search-all", "sidebar-left-home", "sidebar-center-translator",
    "new-sheet", "edit-sheet", "delete-sheet", "new-entry", "edit-entry",
    "delete-entry"
  ]);

  getById('edit-sheet-container-background').classList.add('hide');
  getById('edit-sheet-name').value = "";
  getById('edit-sheet-search-entries').value = "";
  getById('edit-sheet-entry-table-hidden-rows').innerHTML = "";
}

function changeEditSheetName() {
  var name = getById("edit-sheet-name").value;
  var messageEditSheetExists = getById("message-edit-sheet-already-exists");
  var messageEditSheetEmpty = getById("message-edit-sheet-empty-name");
  var messageEditSheetLong = getById("message-edit-sheet-long-name");

  if (name == "" || name.length > 80)
  {
    if (name == "")
    {
      messageEditSheetEmpty.classList.remove("hide");
      messageEditSheetLong.classList.add("hide");
    }
    else
    {
      messageEditSheetEmpty.classList.add("hide");
      messageEditSheetLong.classList.remove("hide");
    }
    disableButtons(["save-edit-sheet"]);
    messageEditSheetExists.classList.add("hide");
  }
  else
  {
    messageEditSheetEmpty.classList.add("hide");
    messageEditSheetLong.classList.add("hide");
    var request = new XMLHttpRequest();

    request.onload = function() {
      var result = JSON.parse(request.responseText)['already_there'];
      if (result)
      {
        disableButtons(["save-edit-sheet"]);
        messageEditSheetExists.classList.remove("hide");
      }
      else
      {
        enableButtons([["save-edit-sheet", saveEditSheet]]);
        messageEditSheetExists.classList.add("hide");
      }
    }

    var prior = getById("edit-sheet-name").placeholder;

    // Points the request at the appropriate command.
    request.open(
      "GET",
      "/sheet_already_exists?name=" + encodeURIComponent(name)
      + "&prior=" + encodeURIComponent(prior), true
    );

    // Sends the request off.
    request.send();
  }
}

function saveEditSheet() {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var already_there = JSON.parse(request.responseText)['already_there'];
    if (already_there)
    {
      alert("Sheet already made!");
    }
    else
    {
      hideEditSheetInterface();
      searchAll();
    }
  };

  // Gets the name of the new sheet.
  var sheetName = getById('edit-sheet-name').value;

  var hiddenRows = getById("edit-sheet-entry-table-hidden-rows").children;
  var childEntries = [];
  for (var i = 0; i < hiddenRows.length; i ++)
  {
    childEntries.push(hiddenRows[i].innerHTML);
  }
  var childEntriesString = JSON.stringify(childEntries);

  var prior = getById("edit-sheet-name").placeholder;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/edit_sheet?name=" + encodeURIComponent(sheetName)
    + "&prior=" + encodeURIComponent(prior)
    + "&entries=" + encodeURIComponent(childEntriesString), true
  );

  // Sends the request off.
  request.send();
}

function keyDownOnEditSheetContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape")
  {
    hideEditSheetInterface();
  }
}

function clickEditSheetEntry(entry) {
  if (entry.classList.contains('selected-row'))
  {
    entry.classList.remove('selected-row');
    var checkRows = getById('edit-sheet-entry-table-hidden-rows').children
    for (var i = 0; i < checkRows.length; i ++)
    {
      if (checkRows[i].innerHTML == entry.firstElementChild.innerHTML)
      {
        checkRows[i].remove();
      }
    }
  }
  else
  {
    entry.classList.add('selected-row');
    var newRow = getById('edit-sheet-entry-table-hidden-rows').insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function editSheetLoadMoreEntries(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    rowsElement = getById('edit-sheet-entry-table-rows');
    var possibleMatches = getById(
      "edit-sheet-entry-table-hidden-rows"
    ).children;

    for (var i = 0; i < returnJSON['entries'].length; i ++)
    {
      var foundHidden = false;
      for (var j = 0; j < possibleMatches.length; j++)
      {
        if (possibleMatches[j].innerHTML == returnJSON["entries"][i][0])
        {
          foundHidden = true;
          break;
        }
      }

      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickEditSheetEntry(this);
      }

      for (var j = 0; j < 4; j ++)
      {
        var cell = document.createElement("td");
        cell.innerHTML = returnJSON["entries"][i][j];
        newRow.appendChild(cell);
      }

      rowsElement.appendChild(newRow);

      if (foundHidden)
      {
        newRow.classList.add("selected-row");
      }
    }
    var loadMoreRow = getById('edit-sheet-entry-load-more-row');
    if (returnJSON['more_entries'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  numberAlready = document.querySelectorAll(
    "#edit-sheet-entry-table-rows>tr"
  ).length

  // Finds the search query
  query = getById("edit-sheet-search-entries").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/load_more_entries?already=" + numberAlready
    + "&query=" + encodeURIComponent(query), true
  );

  // Sends the request off.
  request.send();
}

function editSheetSearchEntries()
{
 // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    var rowsElement = getById('edit-sheet-entry-table-rows');
    rowsElement.innerHTML = "";
    var possibleMatches = getById(
      "edit-sheet-entry-table-hidden-rows"
    ).children;
    for (var i = 0; i < returnJSON["entries"].length; i ++)
    {
      var foundHidden = false;
      for (var j = 0; j < possibleMatches.length; j++)
      {
        if (possibleMatches[j].innerHTML == returnJSON["entries"][i][0])
        {
          foundHidden = true;
          break;
        }
      }

      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        clickEditSheetEntry(this);
      }

      for (var j = 0; j < 4; j ++)
      {
        var cell = document.createElement("td");
        cell.innerHTML = returnJSON["entries"][i][j];
        newRow.appendChild(cell);
      }

      rowsElement.appendChild(newRow);

      if (foundHidden)
      {
        newRow.classList.add("selected-row");
      }
    }

    var loadMoreRow = getById('edit-sheet-entry-load-more-row');
    if (returnJSON['more_entries'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  }

  // Finds the search query
  query = getById("edit-sheet-search-entries").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/create/search?query=" + encodeURIComponent(query)
    + "&sheets=0&entries=1", true
  );

  // Sends the request off.
  request.send();
}
