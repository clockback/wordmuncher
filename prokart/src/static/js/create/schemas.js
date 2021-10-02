function showSchemasInterface(launchFrom, type) {
  sessionStorage.launchFrom = launchFrom;

  disableAllTabbables(`${type}-entry-container-background`);

  getById("add-remove-rows-subschema").onclick = clickAddRowsSubschema;

  getById(
    "schema-heading"
  ).innerHTML = (type == "new") ? "New schema" : "Edit schema";

  addClickEvent("quality-left", moveQualityLeft);
  addClickEvent("quality-right", moveQualityRight);
  addClickEvent("quality-remove", removeQuality);
  addClickEvent("quality-name", clickQualityName);
  addClickEvent("quality-add", addQuality);
  addClickEvent("subschema-name", clickSubschemaName);

  if (type == "edit") {
    unhide(["delete-schema"]);

    var schemaName = getById(
      `${launchFrom}-entry-schema-picker`
    ).children[1].innerHTML;

    openRequest("create/choose_schema", [
      ["schema", schemaName]
    ], processShowSchemasInterface, launchFrom, schemaName);
  }
  else {
    unhide(["schemas-container-background"]);
    hide([`${launchFrom}-entry-container-background`, "delete-schema"]);
    getById("schema-name").focus();
  }
}

function processShowSchemasInterface(request, launchFrom, schemaName) {
  var result = JSON.parse(request.responseText);
  var noSubschemas = result['subschemas'].length;
  var qualities = result['qualities'];
  var subschemas = result['subschemas'];

  // Finds the column and row subschemas.
  var colTable = getById("columns-subschema");
  var rowTable = getById("rows-subschema");

  // Assigns the data-id for the columns subschema.
  colTable.setAttribute("data-id", subschemas[0][0]);

  // Finds the quality cells for the subschemas.
  var columnCells = colTable.querySelectorAll("td:not(.placeholder-cell)");
  var rowCells = rowTable.querySelectorAll("td:not(.placeholder-cell)");

  // Finds the headers for the subschemas.
  var columnHeader = colTable.querySelector("th:first-child");
  var rowHeader = rowTable.querySelector("th:first-child");

  // Finds the table rows for the subschema cells.
  var columnTr = colTable.querySelector("tbody:not(:first-child) tr");
  var rowTr = rowTable.querySelector("tbody:not(:first-child) tr");

  // Writes the schema name at the top.
  var nameEntry = getById('schema-name');
  nameEntry.value = schemaName;
  nameEntry.placeholder = schemaName;

  // Sets the columns header to the correct length and text.
  columnHeader.children[0].innerHTML = subschemas[0][1];
  columnHeader.colSpan = subschemas[0][2] + 1;

  // Removes the second column and row cells.
  columnCells[1].remove();
  rowCells[1].remove();

  // Treats the first column and row cells as the only column cell.
  columnCells[0].querySelector(".quality-right").remove();
  rowCells[0].querySelector(".quality-right").remove();

  // Remembers the first column cell's id.
  columnCells[0].setAttribute('data-id', qualities[0][0]);

  // Uses the first column quality name in the first cell.
  columnCells[0].querySelector('.quality-name').innerHTML = qualities[0][2];

  // Updates the column cells.
  for (var i = 1; i < qualities.length && qualities[i][1] == 0; i ++) {
    var previousColumn = columnTr.querySelector('td:nth-last-child(2)');
    previousColumn.appendChild(generateQualityRight());
    var nextCell = generateLastCell(qualities[i][2], qualities[i][0]);
    columnTr.insertBefore(nextCell, columnTr.querySelector('td:last-child'));
  }

  if (noSubschemas == 1) {
    // Assigns the data-id for the rows subschema.
    rowTable.setAttribute("data-id", -1);

    // Sets the only column row to have a special row.
    rowCells[0].setAttribute('data-id', -1);
    rowCells[0].querySelector('.quality-name').innerHTML = "Single row";
  }
  else if (noSubschemas == 2) {
    // Assigns the data-id for the rows subschema.
    rowTable.setAttribute("data-id", subschemas[1][0]);

    // Sets the rows header to the correct length and text.
    rowHeader.children[0].innerHTML = subschemas[1][1];
    rowHeader.colSpan = subschemas[1][2] + 1;

    // Uses the first row quality name in the first cell.
    rowCells[0].querySelector('.quality-name').innerHTML = qualities[i][2];

    // Remembers the first row cell's id.
    rowCells[0].setAttribute('data-id', qualities[i][0]);

    // Updates the row cells.
    for (var j = i + 1; j < qualities.length; j ++) {
      var previousRow = rowTr.querySelector('td:nth-last-child(2)');
      previousRow.appendChild(generateQualityRight());
      var nextCell = generateLastCell(qualities[j][2], qualities[j][0]);
      rowTr.insertBefore(nextCell, rowTr.querySelector('td:last-child'));
    }

    // Changes the button to allow the user to hide the table.
    var addRemoveRows = getById('add-remove-rows-subschema');
    addRemoveRows.innerHTML = "Remove rows";
    addRemoveRows.onclick = clickRemoveRowsSubschema;

    // Shows the row table.
    getById('rows-subschema').style.visibility = 'visible';
    enableButtons([['swap-subschemas', swapSubschemas]]);
  }
  else {
    alert("Error: schema has more than two subschemas.");
  }

  // Reveals the dialog to the user.
  getById("schema-name").focus();
  unhide(["schemas-container-background"]);
  hide([`${launchFrom}-entry-container-background`]);
}

function hideSchemasInterface() {
  // Hides the dialog box.
  hide(["schemas-container-background"]);

  // Changes the title of the dialog box.
  getById("schema-heading").innerHTML = "New schema";

  // Changes the button.
  var addRemoveRows = getById("add-remove-rows-subschema");
  addRemoveRows.innerHTML = "Add rows";
  addRemoveRows.onclick = clickAddRowsSubschema;

  // Finds the column and row subschemas.
  var colTable = getById("columns-subschema");
  var rowTable = getById("rows-subschema");

  // Finds the quality cells for the subschemas.
  var columnCells = colTable.querySelectorAll("td:not(.placeholder-cell)");
  var rowCells = rowTable.querySelectorAll("td:not(.placeholder-cell)");

  // Finds the headers for the subschemas.
  var columnHeader = colTable.querySelector("th:first-child");
  var rowHeader = rowTable.querySelector("th:first-child");

  // Writes the schema name at the top.
  var nameEntry = getById('schema-name');
  nameEntry.value = '';
  nameEntry.placeholder = '';

  // Hides any messages on the dialog box.
  hide(['message-schema']);

  // Sets the cell widths to 3 for both subschema headers.
  columnHeader.colSpan = 3;
  rowHeader.colSpan = 3;

  // Sets the headers to the defaults.
  columnHeader.children[0].innerHTML = "Columns";
  rowHeader.children[0].innerHTML = "Rows";

  // Removes all but two cells in each subschema.
  var i, j;
  for (i = 0; i < columnCells.length - 1; i++) {
    if (i == 0) {
      columnCells[i].querySelector(".quality-name").innerHTML = "Column 1";
    }
    else if (i == 1) {
      columnCells[i].querySelector(".quality-name").innerHTML = "Column 2";
      var rightArrow = columnCells[i].getElementsByClassName("quality-right");
      if (rightArrow.length > 0) {
        rightArrow[0].remove();
      }
    }
    else {
      columnCells[i].remove();
    }
  }
  for (j = 0; j < rowCells.length - 1; j++) {
    if (j == 0) {
      rowCells[j].querySelector(".quality-name").innerHTML = "Row 1";
    }
    else if (j == 1) {
      rowCells[j].querySelector(".quality-name").innerHTML = "Row 2";
      var rightArrow = rowCells[j].getElementsByClassName("quality-right");
      if (rightArrow.length > 0) {
        rightArrow[0].remove();
      }
    }
    else {
      rowCells[j].remove();
    }
  }

  // Adds on cells if necessary.
  if (i == 1) {
    columnCells[0].appendChild(generateQualityRight());

    var newCol = generateLastCell("Column 2");

    var cellsRow = document.querySelector(
      "#columns-subschema>tbody:nth-child(2)>tr"
    );
    cellsRow.insertBefore(newCol, cellsRow.querySelector("td:last-child"));
  }
  if (j == 1) {
    rowCells[0].appendChild(generateQualityRight());

    var newRow = generateLastCell("Row 2");

    var cellsRow = document.querySelector(
      "#rows-subschema>tbody:nth-child(2)>tr"
    );
    cellsRow.insertBefore(newRow, cellsRow.querySelector("td:last-child"));
  }

  // Hides the row subschema.
  rowTable.style.visibility = "collapse";

  // Opens the appropriate dialog box.
  if (sessionStorage.launchFrom == "new") {
    showNewEntryInterface();
  }
  else {
    showEditEntryInterface();
  }
}

function generateQualityLeft() {
  var leftQuality = document.createElement("span");
  leftQuality.innerHTML = "←";
  leftQuality.classList.add("edit-quality");
  leftQuality.classList.add("quality-left");
  leftQuality.onclick = moveQualityLeft;
  return leftQuality;
}

function generateQualityRight() {
  var rightQuality = document.createElement("span");
  rightQuality.innerHTML = "→";
  rightQuality.classList.add("edit-quality");
  rightQuality.classList.add("quality-right");
  rightQuality.onclick = moveQualityRight;
  return rightQuality;
}

function generateLastCell(qualityText, dataId) {
  var newCell = document.createElement("td");

  newCell.appendChild(generateQualityLeft());

  var qualityName = document.createElement("span");
  qualityName.innerHTML = qualityText;
  qualityName.classList.add("quality-name");
  qualityName.onclick = clickQualityName;
  newCell.appendChild(qualityName);

  var deleteQuality = document.createElement("span");
  deleteQuality.innerHTML = "✖";
  deleteQuality.classList.add("edit-quality");
  deleteQuality.classList.add("quality-remove");
  deleteQuality.onclick = removeQuality;
  newCell.appendChild(deleteQuality);

  if (dataId != null) {
    newCell.setAttribute('data-id', dataId);
  }

  return newCell;
}

function keyDownOnSchemasContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideSchemasInterface();
  }
}

function changeSchemaName() {
  var nameEntry = getById('schema-name');
  var name = nameEntry.value;
  var prior = nameEntry.placeholder ? nameEntry.placeholder : null;
  var message = getById("message-schema");

  if (name == "") {
    message.innerHTML = "Must provide the schema a name.";
    disableButtons(["save-schema"]);
    unhide([message]);
    return;
  }
  else if (name.length > 80) {
    message.innerHTML = "Schema name must be no more than 80 characters."
    disableButtons(["save-schema"]);
    unhide([message]);
    return;
  }
  else {
    openRequest("/create/schema_already_exists", [
      ["name", name], ["prior", prior]
    ], processChangeSchemaName, message);
  }
}

function processChangeSchemaName(request, message) {
  var result = JSON.parse(request.responseText)['already_there'];

  if (result) {
    disableButtons(["save-schema"]);
    message.innerHTML = "Schema with this name already exists."
    unhide([message]);
  }
  else {
    enableButtons([["save-schema", saveSchema]]);
    hide([message]);
  }
}

function checkEnableSaveSchema() {
  var schemaLength = getById("schema-name").value.length;
  if (
    schemaLength > 0 && schemaLength <= 80 &&
    getById("message-schema").classList.contains("hide")
  ) {
    enableButtons([["save-schema", saveSchema]]);
  }
  else {
    disableButtons(["save-schema"]);
  }
}

function clickAddRowsSubschema() {
  this.innerHTML = "Remove rows"
  this.onclick = clickRemoveRowsSubschema;

  var rowsSubschema = getById("rows-subschema");
  rowsSubschema.style.visibility = "visible";

  enableButtons([["swap-subschemas", swapSubschemas]]);
  checkEnableSaveSchema();
}

function clickRemoveRowsSubschema() {
  this.innerHTML = "Add rows"
  this.onclick = clickAddRowsSubschema;

  var rowsSubschema = getById("rows-subschema");
  rowsSubschema.style.visibility = "collapse";

  disableButtons(["swap-subschemas"]);
  checkEnableSaveSchema();
}

function swapQualities(origLeft, origRight) {
  // Switches the cells.
  origLeft.parentNode.insertBefore(origRight, origLeft);

  // Gives new names to the shifted cells.
  var newLeft = origRight;
  var newRight = origLeft;

  // Removes the new cell on the left's left button if it is now the
  // first cell.
  if (newLeft.previousElementSibling == null)
  {
    newLeft.getElementsByClassName("quality-left")[0].remove();
  }

  // Removes the new cell on the right's right button if it is now the
  // last cell.
  if (newRight.nextElementSibling.nextElementSibling == null)
  {
    newRight.getElementsByClassName("quality-right")[0].remove();
  }

  // Gives the new cell on the left a right button if it does not
  // already have one.
  if (newLeft.getElementsByClassName("quality-right").length == 0)
  {
    newLeft.appendChild(generateQualityRight());
  }

  // Gives the new cell on the left a right button if it does not
  // already have one.
  if (newRight.getElementsByClassName("quality-left").length == 0)
  {
    newRight.insertBefore(generateQualityLeft(), newRight.firstElementChild);
  }

  // I don't know why, but the second line stops a bug on Firefox
  // resulting in the right-hand row being invisible until the user
  // clicks, the super key is hit, etc.
  newLeft.removeAttribute("style");
  newRight.style.backgroundColor = "var(--hover-color)";
}

function moveQualityLeft() {
  checkEnableSaveSchema();
  swapQualities(this.parentNode.previousElementSibling, this.parentNode);
}

function moveQualityRight() {
  checkEnableSaveSchema();
  swapQualities(this.parentNode, this.parentNode.nextElementSibling);
}

function removeQuality() {
  // Finds the row and surrounding cells.
  var row = this.parentNode.parentNode;
  var prev = this.parentNode.previousElementSibling;
  var next = this.parentNode.nextElementSibling;

  // Removes the requested cell.
  this.parentNode.remove();

  // Removes the right-arrow on the left-hand cell if necessary.
  if (prev != null && prev.nextElementSibling.nextElementSibling == null) {
    prev.getElementsByClassName("quality-right")[0].remove();
  }

  // Removes the left-arrow on the right-hand cell if necessary.
  if (
    next != null
    && next.getElementsByClassName("quality-left").length > 0
    && next.previousElementSibling == null
  ) {
    next.getElementsByClassName("quality-left")[0].remove();
  }

  // Ensures that there is at least 1 normal cell in the row.
  if (row.children.length == 1) {
    var newCell = document.createElement("td");
    row.insertBefore(newCell, row.firstElementChild);

    var textSpan = document.createElement("span");
    textSpan.innerHTML = "Row 1";
    textSpan.onclick = clickQualityName;
    textSpan.classList.add("quality-name");
    newCell.appendChild(textSpan);

    var deleteButton = document.createElement("span");
    deleteButton.innerHTML = "✖";
    deleteButton.classList.add("edit-quality");
    deleteButton.classList.add("quality-remove");
    deleteButton.onclick = removeQuality;
    newCell.appendChild(deleteButton);
  }
  // Otherwise, decreases the row span for the header.
  else {
    row.parentNode.previousElementSibling.getElementsByTagName(
      "th"
    )[0].colSpan --;
  }

  checkEnableSaveSchema();
}

function clickQualityName() {
  var input = document.createElement("input");
  input.placeholder = this.innerHTML;
  input.value = this.innerHTML;
  input.onkeypress = hitKeyQualityName;
  input.onblur = loseFocusQualityName;
  input.oninput = typeQualityName;
  this.parentNode.insertBefore(input, this)
  this.remove();
  input.focus();

  checkEnableSaveSchema();
}

function hitKeyQualityName(event) {
  if (
    event.key == "Enter"
    && this.value != ""
    && this.value.length <= 80
    && !qualityNameTaken(this)
  ) {
    enterQualityName(this);
  }
}

function enterQualityName(input) {
  var textSpan = document.createElement("span");
  textSpan.classList.add("quality-name");
  textSpan.innerHTML = input.value;
  textSpan.onclick = clickQualityName;
  input.parentNode.insertBefore(textSpan, input);
  input.remove();
}

function typeQualityName() {
  if (this.value == "" || this.value.length > 80 || qualityNameTaken(this)) {
    this.style.backgroundColor = "pink";
  }
  else {
    this.style.backgroundColor = "white";
  }
}

function loseFocusQualityName() {
  var textSpan = document.createElement("span");
  textSpan.classList.add("quality-name");
  textSpan.onclick = clickQualityName;
  if (
    this.value != "" && this.value.length <= 80 && !qualityNameTaken(this)
  ) {
    textSpan.innerHTML = this.value;
  }
  else {
    textSpan.innerHTML = this.placeholder;
  }
  this.parentNode.insertBefore(textSpan, this);
  this.remove();
}

function generateQualityName(qualityType) {
  // Finds the correct prefix.
  var prefix = qualityType == "column" ? "New Column " : "New Row ";

  // Finds a list of all qualities beginning with the prefix.
  var qualitySpans = document.querySelectorAll(
    `#${qualityType}s-subschema td:not(:last-child)>.quality-name`
  );
  var names = [];
  for (var i = 0; i < qualitySpans.length; i ++) {
    var quality = qualitySpans[i].textContent;
    if (quality.startsWith(prefix)) {
      names.push(quality);
    }
  }

  var iText = 1;
  while (true) {
    var found = false;
    for (var i = 0; i < names.length; i ++) {
      if (names[i] == prefix + iText) {
        found = true;
        break;
      }
    }
    if (!found) {
      return prefix + iText;
    }
    iText ++;
  }
}

function addQuality() {
  var row = this.parentNode.parentNode.parentNode;
  var qualityType = row.parentNode.id.split("-")[0].slice(0, -1);

  this.parentNode.previousElementSibling.appendChild(generateQualityRight());

  var newCell = document.createElement("td");

  newCell.appendChild(generateQualityLeft());

  var textSpan = document.createElement("span");
  textSpan.innerHTML = generateQualityName(qualityType);
  textSpan.classList.add("quality-name");
  textSpan.onclick = clickQualityName;
  newCell.appendChild(textSpan);

  var deleteButton = document.createElement("span");
  deleteButton.innerHTML = "✖";
  deleteButton.classList.add("edit-quality");
  deleteButton.classList.add("quality-remove");
  deleteButton.onclick = removeQuality;
  newCell.appendChild(deleteButton);

  this.parentNode.parentNode.insertBefore(newCell, this.parentNode);
  row.previousElementSibling.getElementsByTagName("th")[0].colSpan ++;

  checkEnableSaveSchema();
}

function qualityNameTaken(element) {
  var row = element.parentNode.parentNode;
  var qualityCells = row.getElementsByClassName("quality-name");
  for (var i = 0; i < qualityCells.length; i ++) {
    if (qualityCells[i].innerHTML == element.value) {
      return true;
    }
  }
  return false;
}

function clickSubschemaName() {
  var input = document.createElement("input");
  input.placeholder = this.innerHTML;
  input.value = this.innerHTML;
  input.onkeypress = hitKeySubschemaName;
  input.onblur = loseFocusSubschemaName;
  input.oninput = typeSubschemaName;
  this.parentNode.insertBefore(input, this)
  this.remove();
  input.focus();

  checkEnableSaveSchema();
}

function hitKeySubschemaName() {
  if (
    event.key == "Enter"
    && this.value != ""
    && this.value.length <= 80
    && !subschemaNameTaken(this, true)
  ) {
    enterSubschemaName(this);
  }
}

function enterSubschemaName(input) {
  var textSpan = document.createElement("span");
  textSpan.innerHTML = input.value;
  textSpan.onclick = clickSubschemaName;
  textSpan.classList.add("subschema-name");
  input.parentNode.insertBefore(textSpan, input);
  input.remove();
}

function typeSubschemaName() {
  if (this.value == "" || this.value.length > 80 || subschemaNameTaken(this)) {
    this.style.backgroundColor = "pink";
  }
  else {
    this.style.backgroundColor = "white";
  }
}

function loseFocusSubschemaName() {
  var textSpan = document.createElement("span");
  textSpan.onclick = clickSubschemaName;
  textSpan.classList.add("subschema-name");
  if (
    this.value != ""
    && this.value.length <= 80
    && !subschemaNameTaken(this, true)
  ) {
    textSpan.innerHTML = this.value;
  }
  else {
    textSpan.innerHTML = this.placeholder;
  }
  this.parentNode.insertBefore(textSpan, this);
  this.remove();
}

function subschemaNameTaken(element, change = false) {
  var subschemaCell = document.getElementsByClassName("subschema-name")[0];

  if (subschemaCell.innerHTML == element.value) {
    if (getById("rows-subschema").style.visibility == "collapse")
    {
      if (change)
      {
        subschemaCell.innerHTML = `${element.value} (different)`;
      }
      return false;
    }
    return true;
  }
  return false;
}

function swapSubschemas() {
  // Finds each of the tables and the schema skeleton.
  var columnsTable = getById("columns-subschema");
  var rowsTable = getById("rows-subschema");
  var skeleton = getById("schema-skeleton");

  // Swaps the two tables.
  columnsTable.id = "rows-subschema";
  rowsTable.id = "columns-subschema";

  skeleton.insertBefore(rowsTable, columnsTable);
  skeleton.appendChild(columnsTable);

  checkEnableSaveSchema();
}

function saveSchema() {
  // Finds the name of the schema.
  var name = getById("schema-name").value;

  // Obtains the details for the columns subschema.
  var columnsSubschema = reduceSubschema("columns");
  var columnsName = columnsSubschema[0];
  var columnsQualitiesNames = columnsSubschema[1];
  var columnsDataId = getById("columns-subschema").getAttribute("data-id");

  // Start creating structure for the schema.
  var structure = {"columns": {[columnsName]: [
    columnsDataId, columnsQualitiesNames
  ]}};

  // Consider the rows subschema only if in use.
  if (getById("rows-subschema").style.visibility != "collapse") {
    // Obtains the details for the rows subschema.
    var rowsSubschema = reduceSubschema("rows");
    var rowsName = rowsSubschema[0];
    var rowsQualitiesNames = rowsSubschema[1];
    var rowsDataId = getById("rows-subschema").getAttribute("data-id");

    // Adds the rows to the structure.
    structure["rows"] = {[rowsName]: [rowsDataId, rowsQualitiesNames]};
  }

  var origName = getById("schema-name").placeholder;

  var answers = getSchemaAnswersAlt(sessionStorage.launchFrom);

  // Saves the new schema.
  openRequest("/create/save_schema", [
    ["name", name], ["structure", JSON.stringify(structure)],
    ["origName", origName], ["answers", JSON.stringify(answers)]
  ], processSaveSchema, name);
}

function processSaveSchema(request, name) {
  var returnJSON = JSON.parse(request.responseText);

  // Finds the schema id.
  var schema = returnJSON["schema"];

  // Finds the header for the schema dialog.
  var schemaHeader = getById("schema-heading").innerHTML;

  // Finds whether or not the user is creating or editing an entry.
  var launchFrom = sessionStorage.launchFrom;

  // Finds the picker for the schemas.
  var pickers = document.querySelectorAll(
    `#new-entry-schema-picker,#edit-entry-schema-picker`
  );

  for (var p = 0; p < 2; p ++) {
    var picker = pickers[p];
    if (schemaHeader == "Edit schema") {
      var oldName = getById("schema-name").placeholder;
      var oldOptions = picker.getElementsByTagName("option");
      for (var i = 0; i < oldOptions.length; i ++) {
        if (oldOptions[i].innerHTML == oldName) {
          oldOptions[i].remove();
          picker.children[2].children[i].remove();
          break;
        }
      }
    }

    // Changes the text in the select box to the schema name.
    picker.children[1].innerHTML = name;

    // Creates a new option for the schema picker.
    var newOption = document.createElement("option");
    newOption.innerHTML = name;
    newOption.value = schema;
    var currentOptions = picker.getElementsByTagName("option");
    for (var i = 1; i < currentOptions.length; i ++) {
      if (name.toLowerCase() < currentOptions[i].innerHTML.toLowerCase()) {
        break;
      }
    }
    picker.children[0].insertBefore(newOption, currentOptions[i]);

    // Deselects whichever schema is currently selected.
    if (schemaHeader == "New schema") {
      var selected = picker.querySelector(".same-as-selected");
      selected.classList.remove("same-as-selected");
    }

    // Adds a new div for the drop down.
    var newDiv = document.createElement("div");
    newDiv.innerHTML = name;
    newDiv.classList.add("same-as-selected");

    var chooser = (
      schemaHeader == "Edit schema" ? editEntryChooseSchema : newEntryChooseSchema
    );
    assignBox(newDiv, decorateFunction(chooser, newOption));

    var dropDownDivs = picker.querySelectorAll(".select-items>div");
    picker.children[2].insertBefore(newDiv, dropDownDivs[i]);
  }

  var answers = returnJSON["answers"];
  var twoSchemas = false;

  // Opens the appropriate schema table.
  chooseSchema(newOption, launchFrom, answers);

  // Hides the schemas interface.
  hideSchemasInterface();
}

function reduceSubschema(rowsOrCols) {
  // Finds the subschema.
  var subschema = getById(`${rowsOrCols}-subschema`);

  // Finds the name of the subschema.
  var subschemaHeader = subschema.getElementsByClassName("subschema-name");
  if (subschemaHeader.length == 0) {
    var subschemaName = subschema.querySelector("th>input").placeholder;
  }
  else {
    var subschemaName = subschemaHeader[0].innerHTML;
  }

  var subschemaId = subschema.getAttribute("data-id") ?? -1;

  // Finds the different qualities
  var qualities = subschema.getElementsByTagName("td");
  var qualitiesNames = [];
  for (var i = 0; i < qualities.length - 1; i ++) {
    var cell = qualities[i]
    var cellText = cell.getElementsByClassName("quality-name");
    var cellId = cell.getAttribute("data-id");

    // Finds the name of the Id, placing it in a single-element array.
    var nameAndId = [
      cellText.length == 0 ? cell.getElementsByTagName("input").placeholder
      : cellText[0].innerHTML
    ];

    // If the cell has an id, it is added to the aforementioned array.
    if (cellId != null) {
      nameAndId.push(cellId);
    }

    // Adds the array.
    qualitiesNames.push(nameAndId);
  }

  // Returns the subschema name and its qualities.
  return [subschemaName, qualitiesNames, subschemaId];
}

function showDeleteSchemaInterface() {
  var schemaName = getById("schema-name").placeholder;
  openRequest("/create/count_schema_entries", [
    ["name", schemaName]
  ], processShowDeleteSchemaInterface, schemaName);
}

function processShowDeleteSchemaInterface(request, schemaName) {
  var returnJSON = JSON.parse(request.responseText);

  var deleteSchemaName = getById("delete-schema-name");
  deleteSchemaName.placeholder = schemaName;

  var uses = returnJSON["uses"];
  var schemaUsage = getById("schema-usage");
  if (uses == 0) {
    schemaUsage.innerHTML = "Currently, no solutions use this schema.";
  }
  else if (uses == 1) {
    schemaUsage.innerHTML = "Currently, 1 solution uses this schema.";
  }
  else {
    schemaUsage.innerHTML = `Currently, ${uses} solutions use this schema.`;
  }

  var result = JSON.parse(request.responseText)['already_there'];

  disableAllTabbables("schemas-container-background");

  unhide(["delete-schemas-dialog-container-background"]);
  deleteSchemaName.focus();
}

function hideDeleteSchemaInterface() {
  enableAllTabbables("schemas-container-background");
  hide(["delete-schemas-dialog-container-background"]);
  getById("schema-name").focus();
}

function keyDownOnDeleteSchemaContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape") {
    hideDeleteSchemaInterface();
  }
}

function changeDeleteSchemaName() {
  var nameEntry = getById('delete-schema-name');
  if (nameEntry.placeholder == nameEntry.value) {
    enableButtons([
      ["delete-schema-delete", confirmDeleteSchema, nameEntry.value]
    ]);
  }
  else {
    disableButtons(["delete-schema-delete"]);
  }
}

function confirmDeleteSchema(name) {
  // Deletes the schema.
  openRequest("create/delete_schema", [["schema", name]]);

  // If the user was trying to create a new entry, simply removes the
  // schema and assumes that there is no schema.
  if (sessionStorage.launchFrom == "new") {
    pickNoSchema("new");
    var picker = getById("new-entry-schema-picker");
    var selectOptions = picker.querySelectorAll("option");
    var pickerPanels = picker.querySelectorAll(".select-items>div")
    for (var i = 1; i < selectOptions.length; i ++) {
      if (selectOptions[i].textContent == name) {
        selectOptions[i].remove();
        pickerPanels[i].remove();
        break;
      }
    }
  }

  // Hides both of the schema interfaces.
  hideDeleteSchemaInterface();
  hideSchemasInterface();

  // Refreshes the page if the user was trying to edit an existing
  // entry.
  if (sessionStorage.launchFrom == "edit") {
    window.location.reload();
  }
}
