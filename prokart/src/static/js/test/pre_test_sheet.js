function testSheet(row) {
  var container = getById("pre-test-sheet-container-background");
  container.querySelector(
    "div>div.container-contents>h1"
  ).innerHTML = row.children[0].innerHTML;

  // Prevents selection of now concealed elements.
  disallowTabSelection(["search-sheets", "back-button"]);

  var bar = container.querySelector("div.bar-chart-container");
  var percentage = row.children[1].innerHTML;

  bar.children[0].style.width = percentage + "%";
  bar.children[1].innerHTML = percentage + "% complete";

  if (percentage == 0)
  {
    bar.children[0].style.visibility = "hidden";
  }
  else
  {
    bar.children[0].style.visibility = null;
  }

  // Make container visible.
  container.classList.remove("hide");

  getById("go-button-container").focus();
}

function hideTestSheetInterface(row) {
  // Prevents selection of now concealed elements.
  allowTabSelection(["search-sheets", "back-button"]);

  getById("pre-test-sheet-container-background").classList.add("hide");
}

function keyDownOnTestSheetContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape")
  {
    hideTestSheetInterface();
  }
}

function goTestSheet() {
  var sheetName = document.querySelector(
    "div.container-contents>h1"
  ).innerHTML;
  window.location.href = '/test/' + encodeURIComponent(sheetName);
}
