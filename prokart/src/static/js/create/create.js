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

function pickNoSchema(type) {
  // Hides the schema table and shows the default answer entry.
  var picker = getById(`${type}-entry-schema-picker`);
  picker.children[1].innerHTML = "No schema:";
  options = picker.children[2].children;
  for (var i = 0; i < options.length; i ++) {
    var option = options[i];
    if (i == 0) {
      option.classList.add("same-as-selected");
    }
    else {
      option.classList.remove("same-as-selected");
    }
  }
  hide([`${type}-entry-answer-schema-table`]);
  unhide([`${type}-entry-answer-div`, `${type}-entry-answer-text`]);
  disableButtons([`${type}-entry-edit-schema`]);
}

function noSchema(tableBody, columns) {
  // Clears any existing contents in the table.
  if (tableBody.querySelector(".placeholder-cell") != null) {
    tableBody.firstElementChild.firstElementChild.remove();
  }
  while (tableBody.children.length > 2) {
    tableBody.children[2].remove();
  }
  while (columns.children.length > 0) {
    columns.children[0].remove();
  }
}

function chooseSchema(schemaOption, type, answers, isId) {
  if (schemaOption.value > 0) {
    var schema = schemaOption.innerHTML;
    enableButtons([
      [`${type}-entry-edit-schema`, showSchemasInterface, type, "edit"]
    ]);
    openRequest("/create/choose_schema", [
      ["schema", schema], ["answers", JSON.stringify(answers)], ["isId", isId]
    ], processChooseSchema, type);
  }
  else {
    // Hides the default single answer option.
    getById(`${type}-entry-answer-schema-table`).classList.add("hide");
    unhide([
      `${type}-entry-answer-div`, `${type}-entry-answers-table-container`,
      `${type}-entry-answer-text`, `${type}-entry-more-answers-text`
    ]);
    disableButtons([`${type}-entry-edit-schema`]);
  }
}

function processChooseSchema(request, type) {
  var returnJSON = JSON.parse(request.responseText);

  var subschemas = returnJSON["subschemas"];
  var qualities = returnJSON["qualities"];
  var table = getById(`${type}-entry-answer-schema-table`);
  var tableBody = getById(`${type}-entry-answer-schema-body`);
  var columnHeader = getById(`${type}-entry-answer-schema-columns-header`);
  var columns = getById(`${type}-entry-answer-schema-columns`);

  if (subschemas.length > 2) {
    alert(
      "Schema is too complicated. Prokart only supports schemas with "
      + "one or two subschemas."
    );
    return;
  }

  noSchema(tableBody, columns);

  // Hides the default single answer option.
  hide([
    `${type}-entry-answer-div`, `${type}-entry-answers-table-container`,
    `${type}-entry-answer-text`, `${type}-entry-more-answers-text`
  ]);

  columnHeader.innerHTML = subschemas[0][1];
  columnHeader.colSpan = subschemas[0][2];

  if (subschemas.length == 2) {
    var placeHolder = document.createElement("td");
    placeHolder.colSpan = 2;
    placeHolder.rowSpan = 2;
    placeHolder.classList.add("placeholder-cell");
    columnHeader.parentNode.insertBefore(placeHolder, columnHeader);
  }

  var firstCell = null;

  var i;
  for (i = 0; i < qualities.length && qualities[i][1] == 0; i ++) {
    var columnQuality = document.createElement("th");
    columnQuality.innerHTML = qualities[i][2];
    columns.appendChild(columnQuality);
  }

  if (subschemas.length == 2) {
    for (var j = i; j < qualities.length; j ++) {
      var rowQualityRow = document.createElement("tr");
      tableBody.appendChild(rowQualityRow);

      // If it is the first row, includes a header cell for the rows.
      if (i == j) {
        var rowHeader = document.createElement("th");
        rowHeader.innerHTML = subschemas[1][1];
        rowHeader.rowSpan = subschemas[1][2];
        rowQualityRow.appendChild(rowHeader);
      }

      var rowQuality = document.createElement("th");
      rowQuality.innerHTML = qualities[j][2];
      rowQualityRow.appendChild(rowQuality);

      // Fills all the cells in the table.
      for (var k = 0; qualities[k][1] == 0; k ++) {
        var newCell = document.createElement("td");
        newCell.onclick = decorateFunction(clickCell, newCell);
        rowQualityRow.appendChild(newCell);
        if (firstCell == null) {
          firstCell = newCell;
        }
        newCell.setAttribute("data-row", qualities[j][0]);
        newCell.setAttribute("data-col", qualities[k][0]);
      }
    }
  }
  else {
    var singleRow = document.createElement("tr");
    tableBody.appendChild(singleRow);

    for (var j = 0; j < qualities.length; j ++) {
      var newCell = document.createElement("td");
      newCell.onclick = decorateFunction(clickCell, newCell);
      newCell.style.height = "30px";
      newCell.setAttribute("data-col", qualities[j][0]);
      singleRow.appendChild(newCell);
      if (firstCell == null) {
        firstCell = newCell;
      }
    }
  }

  table.classList.remove("hide");

  answers = returnJSON["answers"];

  if (answers == null) {
    clickCell(firstCell);
  }
  else {
    var schemaTable = getById(`${type}-entry-answer-schema-div`);
    var schemaRows = schemaTable.querySelectorAll(
      "tr:not(:first-child):not(:nth-child(2))"
    );
    var schemaCells = schemaTable.getElementsByTagName("td");

    for (var column_s in answers) {
      // Ignores the name key.
      if (column_s == "name") {
        continue;
      }

      var column = findQualityPos(qualities, parseInt(column_s));
      if (column == null) {
        continue;
      }

      if (typeof(answers[column_s]) == typeof("")) {
        schemaCells[column].innerHTML = answers[column_s];
      }
      else {
        for (var row_s in answers[column_s]) {
          var row = findQualityPos(qualities, parseInt(row_s));
          if (row == null) {
            continue;
          }
          var cell = schemaRows[row].getElementsByTagName("td")[column];
          cell.innerHTML = answers[column_s][row_s];
        }
      }
    }
  }
}

function findQualityPos(qualities, quality) {
  for (var i = 0; i < qualities.length; i ++) {
    if (qualities[i][0] == quality) {
      return qualities[i][3];
    }
  }
}

function clickCell(cell) {
  cell.onclick = null;
  var input = document.createElement("input");
  input.onblur = decorateFunction(finishCell, cell);
  input.onkeypress = hitKeyCell;
  input.oninput = decorateFunction(typeCell, input);
  input.value = cell.innerHTML;
  input.placeholder = cell.innerHTML;
  input.style.width = "7em";
  cell.innerHTML = "";
  cell.appendChild(input);
  input.focus();
}

function finishCell(cell) {
  var input = cell.children[0];
  var text = input.value.length > 80 ? input.placeholder : input.value;
  input.remove();
  cell.innerHTML = text;
  cell.onclick = decorateFunction(clickCell, cell);
}

function hitKeyCell() {
  if (event.key == "Enter") {
    var cell = this.parentNode;
    finishCell(cell);
    var cells = cell.parentNode.parentNode.querySelectorAll(
      "td:not(.placeholder-cell)"
    );
    for (var i = 0; i < cells.length - 1; i ++) {
      if (cells[i] == cell) {
        clickCell(cells[i + 1]);
        return;
      }
    }
  }
}

function typeCell(input) {
  input.style.backgroundColor = input.value.length > 80 ? "pink" : "white";
  validEntry();
}

function createPopulateSelectBoxes() {
  populateSelectBoxes(
    newEntryChooseSchema, true, "new-entry-container-background"
  );
  populateSelectBoxes(
    editEntryChooseSchema, true, "edit-entry-container-background"
  );
}

function validSchemaAnswer(type) {
  var schemaTable = getById("new-entry-answer-schema-table");

  // Returns false if the schema table is hidden.
  if (schemaTable.classList.contains("hide")) {
    schemaTable = getById("edit-entry-answer-schema-table");
    if (schemaTable.classList.contains("hide")) {
      return false;
    }
  }

  var inputs = schemaTable.getElementsByTagName("input");
  if (inputs.length == 1) {
    // Returns true if the current input is a valid answer.
    if (inputs[0].value.length <= 80 && inputs[0].value.length > 0) {
      return true;
    }
    // Returns false if the current input is an invalid answer. Note
    // that the input is ignored if empty (i.e. not an answer at all).
    else if (inputs[0].value.length > 80) {
      return false;
    }
  }

  var cells = schemaTable.querySelectorAll("td:not(.placeholder-cell)");

  // Returns true if at least one cell contains an answer.
  for (var i = 0; i < cells.length; i ++) {
    if (
        cells[i].innerHTML != ""
        && cells[i].getElementsByTagName("input").length == 0
      ) {
      return true;
    }
  }

  // If no full cell was found, returns false.
  return false;
}

function validEntry() {
  var bg = getById("new-entry-container-background");
  var type = "new";
  if (bg.classList.contains("hide")) {
    bg = getById("edit-entry-container-background");
    if (bg.classList.contains("hide")) {
      return;
    }
    var type = "edit";
  }

  var question = getById(`${type}-entry-question`);
  var questionLength = question.value.length;
  var answer = getById(`${type}-entry-answer`);
  var answerLength = answer.value.length;

  if (0 < questionLength && questionLength <= 80 && ((
    !answer.classList.contains("hide")
    && 0 < answerLength && answerLength <= 80
  ) || validSchemaAnswer(type))) {
    var clickFunction = (type == "new") ? saveNewEntry : saveEditEntry;
    enableButtons([[`save-${type}-entry`, clickFunction]]);
  }
  else {
    disableButtons([`save-${type}-entry`]);
  }
}

function getSchemaAnswers(type) {
  // Finds the table for the schema that has been filled.
  var tableBody = getById(`${type}-entry-answer-schema-body`);

  // Finds out whether or not the table has two subschemas.
  var double = tableBody.getElementsByClassName("placeholder-cell").length > 0;

  // Finds all the cells.
  var rows = tableBody.querySelectorAll(
    "tr:not(:first-child):not(:nth-child(2))"
  );

  var results = {};

  for (var i = 0; i < rows.length; i ++) {
    var rowCells = rows[i].getElementsByTagName("td");
    for (var j = 0; j < rowCells.length; j++) {
      var cellText = rowCells[j].innerHTML;
      if (cellText != "") {
        if (!(j in results)) {
          results[j] = double ? {[i]: cellText} : cellText;
        }
        else {
          results[j][i] = cellText;
        }
      }
    }
  }

  results["name"] = getById(
    `${type}-entry-schema-picker`
  ).children[1].innerHTML;

  return results;
}

function getSchemaAnswersAlt(type) {
  // Finds the table for the schema that has been filled.
  var tableBody = getById(`${type}-entry-answer-schema-body`);

  // Finds out whether or not the table has two subschemas.
  var double = tableBody.getElementsByClassName("placeholder-cell").length > 0;

  // Finds all the cells.
  var cells = tableBody.querySelectorAll("tr:not(:first-child)>td");

  // Stores the answers, as well as the name.
  var answers = {"name": getById(
    `${type}-entry-schema-picker`
  ).children[1].innerHTML};

  // Adds each of the cells.
  for (var i = 0; i < cells.length; i ++) {
    // Identifies the particular cell.
    var cell = cells[i];

    // Finds the quality ID value(s) of the cell.
    var column = cell.getAttribute("data-col");
    var row = cell.getAttribute("data-row");

    // Checks if any answer has yet been generated for the particular
    // column.
    if (answers[column] == null) {
      // If it is the first of a number of answers for the column,
      // initiates a list.
      if (double) {
        answers[column] = {};
      }

      // If there are no rows (and thus there is only one answer per
      // column), sets the answer.
      else {
        answers[column] = cell.innerHTML;
        continue;
      }
    }

    // Adds the answer to the collection for rows.
    answers[column][row] = cell.innerHTML;
  }

  // Returns the structure of answers.
  return answers;
}

window.addEventListener('load', createPopulateSelectBoxes);
