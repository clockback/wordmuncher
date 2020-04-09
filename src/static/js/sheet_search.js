function searchSheets(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    document.getElementById('sheet-table-rows').innerHTML = returnJSON['html'];
    var loadMoreRow = document.getElementById('load-more-row');
    if (returnJSON['more_sheets'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  };

  // Finds the current search query.
  var query = document.getElementById('search-sheet-entry').value;

  // Points the request at the appropriate command.
  request.open("GET", "/test/search?q=" + encodeURIComponent(query) + "&n=0", true);

  // Sends the request off.
  request.send();
}

function loadMoreSheets(numberAlready) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);
    document.getElementById('sheet-table-rows').innerHTML += returnJSON['html'];
    var loadMoreRow = document.getElementById('load-more-row');
    if (returnJSON['load_more'] == true)
    {
        loadMoreRow.style.visibility = 'visible';
    }
    else
    {
        loadMoreRow.style.visibility = 'collapse';
    }
  };

  // Finds the current search query.
  var query = document.getElementById('search-sheet-entry').value;

  // Finds the number of entries already
  var n = document.getElementById('sheet-table-rows').children.length;

  // Points the request at the appropriate command.
  request.open("GET", "/test/search?q=" + encodeURIComponent(query) + "&n=" + n, true);

  // Sends the request off.
  request.send();
}

function returnSearchSheets(e) {
  // Only succeeds if the enter/return key was pressed.
  if (e.keyCode == 13)
  {
    searchSheets(0);
  }
}

function checkSheet() {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
  };

  var sheetName = document.getElementById('new-sheet-name').value;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/customize/check_sheet?sheet=" + encodeURIComponent(sheetName),
    true
  );

  // Sends the request off.
  request.send();
}

