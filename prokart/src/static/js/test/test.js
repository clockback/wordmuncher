function searchSheets(numberAlready) {
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
        testSheet(this);
      };

      for (var j = 0; j < 3; j ++)
      {
        var newCell = document.createElement("td");
        newCell.innerHTML = returnJSON['sheets'][i][j];
        newRow.appendChild(newCell);
      }
      sheetTableRows.appendChild(newRow);
    }

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
  var query = document.getElementById('search-sheets').value;

  // Points the request at the appropriate command.
  request.open("GET", "/test/search?query=" + encodeURIComponent(query), true);

  // Sends the request off.
  request.send();
}

function loadMoreSheets() {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    var returnJSON = JSON.parse(request.responseText);

    var sheetTableRows = document.getElementById('sheet-table-rows');
    for (var i = 0; i < returnJSON['sheets'].length; i ++)
    {
      var newRow = document.createElement("tr");
      newRow.style["cursor"] = "pointer";
      newRow.onclick = function () {
        testSheet(this);
      };

      for (var j = 0; j < 3; j ++)
      {
        var newCell = document.createElement("td");
        newCell.innerHTML = returnJSON['sheets'][i][j];
        newRow.appendChild(newCell);
      }
      sheetTableRows.appendChild(newRow);
    }

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
  var query = document.getElementById('search-sheets').value;

  // Finds the number of entries already
  var already = document.getElementById('sheet-table-rows').children.length;

  // Points the request at the appropriate command.
  request.open(
    "GET", "/test/load_more_sheets?query=" + encodeURIComponent(query)
    + "&already=" + already, true
  );

  // Sends the request off.
  request.send();
}
