function disallowTabSelection(toCover) {
  for (var i = 0; i < toCover.length; i ++)
  {
    document.getElementById(toCover[i]).setAttribute("tabindex", "-1");
  }
}

function allowTabSelection(toCover) {
  for (var i = 0; i < toCover.length; i ++)
  {
    document.getElementById(toCover[i]).removeAttribute("tabindex");
  }
}

function disableButtons(toDisable) {
  for (var i = 0; i < toDisable.length; i ++)
  {
    var button = document.getElementById(toDisable[i]);
    button.classList.add("button-disabled");
    button.onclick = "";
  }
}
