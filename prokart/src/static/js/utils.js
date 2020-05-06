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

function disallowTabSelection(toCover) {
  // Prevents the user from selecting the elements using the TAB key.
  for (var i = 0; i < toCover.length; i ++) {
    stringToElement(toCover[i]).setAttribute("tabindex", "-1");
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

function enableButtons(toDisable) {
  // Enables each of the buttons, both by class and event.
  for (var i = 0; i < toDisable.length; i ++) {
    var button = stringToElement(toDisable[i][0]);
    button.classList.remove("button-disabled");
    button.onclick = toDisable[i][1];
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
