function showNewSheetInterface() {
  document.getElementById("message-new-sheet-already-exists").classList.add(
    'hide'
  );
  document.getElementById("message-new-sheet-empty-name").classList.add(
    'hide'
  );
  document.getElementById("message-new-sheet-long-name").classList.add(
    'hide'
  );
  document.getElementById('back').setAttribute("tabindex", "-1");
  document.getElementById('search-all').setAttribute("tabindex", "-1");
  document.getElementById('sidebar-left-home').setAttribute("tabindex", "-1");
  document.getElementById('sidebar-center-translator').setAttribute(
    "tabindex", "-1"
  );
  newSheetSearchEntries();

  var saveButton = document.getElementById("save-new-sheet");
  saveButton.onclick = "";
  saveButton.classList.add("button-disabled");

  document.getElementById('add-sheet-container-background').classList.remove(
    'hide'
  );
  document.getElementById('new-sheet-name').focus();
}

function hideNewSheetInterface() {
  document.getElementById('add-sheet-container-background').classList.add(
    'hide'
  );
  document.getElementById('back').removeAttribute("tabindex");
  document.getElementById('new-sheet-name').value = "";
  document.getElementById('new-sheet-search-entries').value = "";
  document.getElementById('search-all').removeAttribute("tabindex");
  document.getElementById('sidebar-left-home').removeAttribute("tabindex");
  document.getElementById('sidebar-center-translator').removeAttribute(
    "tabindex"
  );
  document.getElementById('new-sheet-entry-table-hidden-rows').innerHTML = "";
}

function changeNewSheetName() {
  var name, saveButton, saveButton, messageNewSheetExists;
  var messageNewSheetEmpty, messageNewSheetLong;

  name = document.getElementById("new-sheet-name").value;
  saveButton = document.getElementById("save-new-sheet");
  messageNewSheetExists = document.getElementById(
    "message-new-sheet-already-exists"
  );
  messageNewSheetEmpty = document.getElementById(
    "message-new-sheet-empty-name"
  );
  messageNewSheetLong = document.getElementById("message-new-sheet-long-name");

  if (name == "" || name.length > 80)
  {
    if (name == "")
    {
      messageNewSheetEmpty.classList.remove("hide");
      messageNewSheetLong.classList.add("hide");
    }
    else
    {
      messageNewSheetEmpty.classList.add("hide");
      messageNewSheetLong.classList.remove("hide");
    }
    saveButton.classList.add("button-disabled");
    saveButton.onclick = "";
    messageNewSheetExists.classList.add("hide");
  }
  else
  {
    messageNewSheetEmpty.classList.add("hide");
    messageNewSheetLong.classList.add("hide");
    var request = new XMLHttpRequest();

    request.onload = function() {
      var result = JSON.parse(request.responseText)['already_there'];
      if (result)
      {
        saveButton.classList.add("button-disabled");
        saveButton.onclick = "";
        messageNewSheetExists.classList.remove("hide");
      }
      else
      {
        saveButton.classList.remove("button-disabled");
        saveButton.onclick = saveNewSheet;
        messageNewSheetExists.classList.add("hide");
      }
    }

    // Points the request at the appropriate command.
    request.open(
      "GET",
      "/customize/sheet_already_exists?name=" + encodeURIComponent(name), true
    );

    // Sends the request off.
    request.send();
  }
}

function saveNewSheet() {
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
      hideNewSheetInterface();
      searchAll();
    }
  };

  // Gets the name of the new sheet.
  var sheetName = document.getElementById('new-sheet-name').value;

  var hiddenRows = document.getElementById(
    "new-sheet-entry-table-hidden-rows"
  ).children;
  var childEntries = [];
  for (var i = 0; i < hiddenRows.length; i ++)
  {
    childEntries.push(hiddenRows[i].innerHTML);
  }
  var childEntriesString = JSON.stringify(childEntries);

  // Points the request at the appropriate command.
  request.open(
    "GET", "/customize/new_sheet?name=" + encodeURIComponent(sheetName)
    + "&entries=" + encodeURIComponent(childEntriesString), true
  );

  // Sends the request off.
  request.send();
}

function keyDownOnNewSheetContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape")
  {
    hideNewSheetInterface();
  }
}

function clickNewSheetEntry(entry) {
  if (entry.classList.contains('selected-row'))
  {
    entry.classList.remove('selected-row');
    var checkRows = document.getElementById(
      'new-sheet-entry-table-hidden-rows'
    ).children
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
    var newRow = document.getElementById(
      'new-sheet-entry-table-hidden-rows'
    ).insertRow(-1);
    newRow.innerHTML = entry.firstElementChild.innerHTML;
  }
}

function newSheetLoadMoreEntries(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    rowsElement = document.getElementById('add-sheet-entry-table-rows');
    var possibleMatches = document.getElementById(
      "new-sheet-entry-table-hidden-rows"
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
        clickNewSheetEntry(this);
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
    var loadMoreRow = document.getElementById('new-sheet-entry-load-more-row');
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
    "#add-sheet-entry-table-rows>tr"
  ).length

  // Finds the search query
  query = document.getElementById("new-sheet-search-entries").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/customize/load_more_entries?already=" + numberAlready
    + "&query=" + encodeURIComponent(query), true
  );

  // Sends the request off.
  request.send();
}

function newSheetSearchEntries()
{
 // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    var rowsElement = document.getElementById('add-sheet-entry-table-rows');
    rowsElement.innerHTML = "";
    var possibleMatches = document.getElementById(
      "new-sheet-entry-table-hidden-rows"
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
        clickNewSheetEntry(this);
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

    var loadMoreRow = document.getElementById('new-sheet-entry-load-more-row');
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
  query = document.getElementById("new-sheet-search-entries").value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/customize/search?query=" + encodeURIComponent(query)
    + "&sheets=0&entries=1", true
  );

  // Sends the request off.
  request.send();
}
