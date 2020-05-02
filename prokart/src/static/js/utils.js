function disallowTabSelection(toCover) {
  // Prevents the user from selecting the elements using the TAB key.
  for (var i = 0; i < toCover.length; i ++)
  {
    document.getElementById(toCover[i]).setAttribute("tabindex", "-1");
  }
}

function allowTabSelection(toCover) {
  // Allows the user to select the elements using the TAB key.
  for (var i = 0; i < toCover.length; i ++)
  {
    document.getElementById(toCover[i]).removeAttribute("tabindex");
  }
}

function disableButtons(toDisable) {
  // Disables each of the buttons, both by class and by event.
  for (var i = 0; i < toDisable.length; i ++)
  {
    var button = document.getElementById(toDisable[i]);
    button.classList.add("button-disabled");
    button.onclick = "";
  }
}

function enableButtons(toDisable) {
  // Enables each of the buttons, both by class and event.
  for (var i = 0; i < toDisable.length; i ++)
  {
    if (typeof(toDisable[i][0]) == "string") {
      var button = document.getElementById(toDisable[i][0]);
    }
    else {
      var button = toDisable[i][0];
    }
    button.classList.remove("button-disabled");
    button.onclick = toDisable[i][1];
  }
}
