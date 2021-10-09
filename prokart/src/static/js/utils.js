/*

import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';

alert(SQLiteFS);

*/

function getById(id) {
  // Returns the element with the requested id.
  try {
    return document.getElementById(id);
  }
  catch(error) {
    throw `Element not found: ${id}.`;
  }
}

function stringToElement(id) {
  // If the value is a string, returns the corresponding element.
  if (typeof(id) == "string") {
    return getById(id);
  }

  // Otherwise assumes that the item is the element itself.
  else {
    return id;
  }
}

function allowTabSelection(toCover) {
  // Allows the user to select the elements using the TAB key.
  for (var i = 0; i < toCover.length; i ++) {
    stringToElement(toCover[i]).removeAttribute("tabindex");
  }
}

function disableButtons(toDisable) {
  // Disables each of the buttons, both by class and by event.
  for (var i = 0; i < toDisable.length; i ++) {
    var button = stringToElement(toDisable[i]);
    button.classList.add("button-disabled");
    button.onclick = "";
  }
}

function enableButtons(toEnable) {
  // Enables each of the buttons, both by class and event.
  for (var i = 0; i < toEnable.length; i ++) {
    var button = stringToElement(toEnable[i][0]);
    button.classList.remove("button-disabled");
    if (toEnable[i].length <= 2) {
      button.onclick = toEnable[i][1];
    }
    else {
      button.onclick = decorateFunction(
        toEnable[i][1], ...Array.from(toEnable[i]).slice(2)
      );
    }
  }
}

function hide(toHide) {
  // Hides the specified elements using the class 'hide'.
  for (var i = 0; i < toHide.length; i ++) {
    stringToElement(toHide[i]).classList.add('hide');
  }
}

function unhide(toUnhide) {
  // Unhides the specified elements using the class 'hide'.
  for (var i = 0; i < toUnhide.length; i ++) {
    stringToElement(toUnhide[i]).classList.remove('hide');
  }
}

function openRequest(url, params, callback) {
  // Builds a request URI

  var request = new XMLHttpRequest();
  var buildUrl = url;
  var args = arguments;

  if (callback != null) {
    request.onload = function () {
      callback(request, ...Array.from(args).slice(3));
    };
  }

  for (var i = 0; i < params.length; i ++) {
    if (i == 0) {
      buildUrl += "?";
    }
    else {
      buildUrl += "&";
    }
    buildUrl += `${params[i][0]}=${encodeURIComponent(params[i][1])}`;
  }

  request.open("GET", buildUrl, true);
  request.send();
}

function populateSelectBoxes(callable, preserve, idAbove) {
  var selectDiv, i, j, selectElement, selectedOption, hiddenOptions,
    hiddenOption, startJ;

  // Look for any elements with the class "custom-select":
  if (idAbove == null) {
    selectDiv = document.getElementsByClassName("custom-select");
  }
  else {
    selectDiv = document.querySelectorAll(`#${idAbove} .custom-select`);
  }
  for (i = 0; i < selectDiv.length; i++) {
    selectElement = selectDiv[i].getElementsByTagName("select")[0];

    // For each element, create a new DIV that will act as the selected item:
    selectedOption = document.createElement("div");
    selectedOption.setAttribute("class", "select-selected");
    selectedOption.innerHTML = selectElement.options[
      selectElement.selectedIndex
    ].innerHTML;
    selectDiv[i].appendChild(selectedOption);

    // For each element, create a new DIV that will contain the option list:
    hiddenOptions = document.createElement("div");
    hiddenOptions.classList.add("select-items");
    hiddenOptions.classList.add("select-hide");
    startJ = preserve ? 0 : 1; // Include selected box if requested.
    for (j = startJ; j < selectElement.length; j++) {
      /* For each option in the original select element, create a new DIV that
      will act as an option item: */
      hiddenOption = document.createElement("div");
      if (j == 0) {
        hiddenOption.classList.add("same-as-selected");
      }
      hiddenOption.innerHTML = selectElement.options[j].innerHTML;
      assignBox(hiddenOption, decorateFunction(callable, selectElement[j]));
      hiddenOptions.appendChild(hiddenOption);
    }
    selectDiv[i].appendChild(hiddenOptions);
    selectedOption.onclick = selectBox;
  }
}

function assignBox(hiddenOption, callable) {
  hiddenOption.onclick = function() {
    updateSelectBox(hiddenOption, callable);
  }
}

function selectBox(event) {
  /* When the select box is clicked, close any other select boxes, and
  open/close the current select box: */
  event.stopPropagation();
  closeAllSelect(this);
  this.nextSibling.classList.toggle("select-hide");
  this.classList.toggle("select-arrow-active");
};

function closeAllSelect(element) {
  // A function that will close all select boxes in the document, except
  // the current select box:
  var selectItems, selectedItems, i, arrNo = [];
  selectItems = document.getElementsByClassName("select-items");
  selectedItems = document.getElementsByClassName("select-selected");
  for (i = 0; i < selectedItems.length; i++) {
    if (element == selectedItems[i]) {
      arrNo.push(i)
    }
    else {
      selectedItems[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < selectItems.length; i++) {
    if (arrNo.indexOf(i)) {
      selectItems[i].classList.add("select-hide");
    }
  }
}

function updateSelectBox(element, callable) {
  // When an item is clicked, update the original select box, and the
  // selected item:
  var selectNode = element.parentNode.parentNode.getElementsByTagName(
    "select"
  )[0];
  var selectedNode = element.parentNode.previousSibling;
  for (var i = 0; i < selectNode.length; i++) {
    if (selectNode.options[i].innerHTML == element.innerHTML) {
      selectNode.selectedIndex = i;
      selectedNode.innerHTML = element.innerHTML;
      var repeatOption = element.parentNode.getElementsByClassName(
        "same-as-selected"
      );
      for (var k = 0; k < repeatOption.length; k++) {
        repeatOption[k].removeAttribute("class");
      }
      element.setAttribute("class", "same-as-selected");
      break;
    }
  }
  selectedNode.click();

  callable();
}

function addClickEvent(className, callable) {
  // When an element with the provided class is clicked, the function
  // is called.
  var elements = document.getElementsByClassName(className);
  for (var i = 0; i < elements.length; i ++) {
    elements[i].onclick = callable;
  }
}

function decorateFunction(callable) {
  var args = arguments;
  return function () {
    callable(...Array.from(args).slice(1))
  }
}

function changeRangeValue(textId) {
  var slider = getById(textId);
  var sliderVal = slider.value;
  var textBox = getById(`${textId}-value`);
  var options = document.querySelectorAll(`#${textId}-options>option`);

  var bestVal = null;
  var bestDiff = null;

  for (var i = 0; i < options.length; i ++) {
    var option = options[i];
    var optionVal = option.value;
    var diff = Math.abs(Number(optionVal) - Number(sliderVal));
    if (bestVal == null || diff < bestDiff) {
      bestVal = optionVal;
      bestDiff = diff;
    }
  }

  textBox.innerHTML = bestVal;
  slider.value = bestVal;
}

function bindButtonKeyPressEvents(element, func) {
  element.onkeypress = function (event) {
    buttonKeyPressEvent(func, element, event);
  };
}

function buttonKeyPressEvent(func, element, event) {
  if (event.key == "Enter" || event.key == " ") {
    func(element);
  }
}

function disableAllTabbables(parent) {
  if (typeof(parent) == "string") {
    parent = getById(parent);
  }

  var allElements = parent.querySelectorAll(
    "button,input,[tabindex]:not([tabindex='-1'])"
  );

  for (var i = 0; i < allElements.length; i ++) {
    var element = allElements[i];
    element.setAttribute("tabindex", "-1");
  }
}

function enableAllTabbables(parent) {
  if (typeof(parent) == "string") {
    parent = getById(parent);
  }

  var allElements = parent.querySelectorAll(
    "button,input,[tabindex='-1']:not([data-tabbable])"
  );

  for (var i = 0; i < allElements.length; i ++) {
    var element = allElements[i];
    if (element.tagName == "button" || element.tagName == "input") {
      element.removeAttribute("tabindex");
    }
    else {
      element.setAttribute("tabindex", "0");
    }
  }
}
