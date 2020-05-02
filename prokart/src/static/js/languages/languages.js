function closeAllSelect(element) {
  // A function that will close all select boxes in the document, except
  // the current select box:
  var selectItems, selectedItems, i, arrNo = [];
  selectItems = document.getElementsByClassName("select-items");
  selectedItems = document.getElementsByClassName("select-selected");
  for (i = 0; i < selectedItems.length; i++)
  {
    if (element == selectedItems[i])
    {
      arrNo.push(i)
    }
    else
    {
      selectedItems[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < selectItems.length; i++)
  {
    if (arrNo.indexOf(i))
    {
      selectItems[i].classList.add("select-hide");
    }
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

function updateSelectBox(event) {
  // When an item is clicked, update the original select box, and the
  // selected item:
  var selectNode = this.parentNode.parentNode.getElementsByTagName(
    "select"
  )[0];
  var selectedNode = this.parentNode.previousSibling;
  for (var i = 0; i < selectNode.length; i++) {
    if (selectNode.options[i].innerHTML == this.innerHTML) {
      selectNode.selectedIndex = i;
      selectedNode.innerHTML = this.innerHTML;
      var repeatOption = this.parentNode.getElementsByClassName(
        "same-as-selected"
      );
      for (var k = 0; k < repeatOption.length; k++) {
        repeatOption[k].removeAttribute("class");
      }
      this.setAttribute("class", "same-as-selected");
      break;
    }
  }
  selectedNode.click();

  if (document.querySelectorAll(
    "#translate-from .same-as-selected,#translate-to .same-as-selected"
  ).length == 2)
  {
    enableButtons([["save-button", saveTranslator]]);
  }
}

function populateSelectBoxes() {
  var selectDiv, i, j, selectElement, selectedOption, hiddenOptions,
    hiddenOption;

  // Look for any elements with the class "custom-select":
  selectDiv = document.getElementsByClassName("custom-select");
  for (i = 0; i < selectDiv.length; i++)
  {
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
    for (j = 1; j < selectElement.length; j++)
    {
      /* For each option in the original select element, create a new DIV that
      will act as an option item: */
      hiddenOption = document.createElement("div");
      hiddenOption.innerHTML = selectElement.options[j].innerHTML;
      hiddenOption.onclick = updateSelectBox;
      hiddenOptions.appendChild(hiddenOption);
    }
    selectDiv[i].appendChild(hiddenOptions);
    selectedOption.onclick = selectBox;
  }
}

function saveTranslator() {
  var request = new XMLHttpRequest();

  var translateFrom = document.querySelector(
    "#translate-from>.select-selected"
  ).innerHTML.trim().slice(5);
  var translateTo = document.querySelector(
    "#translate-to>.select-selected"
  ).innerHTML.trim().slice(5);

  request.onload = function () {
    window.location.href = "/";
  };

  request.open(
    "GET", "/languages/update_translator?from="
    + encodeURIComponent(translateFrom) + "&to="
    + encodeURIComponent(translateTo)
  );
  request.send();
}

function expandFlags(element) {
  var allCollapseFlags = document.getElementsByClassName("flag-button");
  var hiddenLanguages = document.getElementById("hidden-flags");
  element.classList.add("flag-drop-down");
  element.onclick = function () {
    condenseFlags(this);
  };

  if (allCollapseFlags.length == 0)
  {
    var request = new XMLHttpRequest();

    request.onload = function () {
      returnJSON = JSON.parse(request.responseText);
      sheets = returnJSON["flags"];
      var hiddenFlags = document.getElementById("hidden-flags");

      for (var i = 0; i < sheets.length; i ++)
      {
        var flag = sheets[i][0];
        var country = sheets[i][1];

        var newButtonDiv = document.createElement("div");
        newButtonDiv.style.display = "inline-block";
        newButtonDiv.classList.add("tooltip");

        var newButton = document.createElement("button");
        newButtonDiv.appendChild(newButton);
        newButton.classList.add("flag-button");
        newButton.onclick = function () {
          selectFlag(this);
        };
        newButton.innerHTML = flag;
        if (flag == element.innerHTML)
        {
          newButton.style.display = "none";
        }
        hiddenFlags.appendChild(newButtonDiv);

        var tooltip = document.createElement("span");
        tooltip.classList.add("tooltip-text");
        tooltip.innerHTML = country;
        newButtonDiv.appendChild(tooltip);
      }
      hiddenLanguages.style.display = null;
    };

    request.open("GET", "/languages/get_flags");
    request.send();
  }
  else
  {
    hiddenLanguages.style.display = null;
  }
}

function condenseFlags(element) {
  var hiddenLanguages = document.getElementById("hidden-flags");
  hiddenLanguages.style.display = "none";
  element.classList.remove("flag-drop-down");
  element.onclick = function () {
    expandFlags(this);
  }
}

function selectFlag(element) {
  var allCollapseFlags = document.getElementsByClassName("flag-button");
  for (var i = 0; i < allCollapseFlags.length; i ++)
  {
    allCollapseFlags[i].style.display = null;
  }
  element.style.display = "none";
  var flagButton = document.getElementById("choose-flag");
  flagButton.innerHTML = element.innerHTML;
  condenseFlags(flagButton);
  flagButton.focus();
}

function changeLanguageName() {
  var languageName = document.getElementById("language-name").value;

  if (languageName && languageName.length <= 40)
  {
    var request = new XMLHttpRequest();

    request.onload = function () {
      var returnJSON = JSON.parse(request.responseText);
      if (returnJSON["found"])
      {
        disableButtons(["add-button"]);
      }
      else
      {
        enableButtons([["add-button", saveLanguage]]);
      }
    };

    request.open(
      "GET", "/languages/check_language?name=" + encodeURIComponent(languageName)
    );

    request.send();
  }
  else
  {
    disableButtons(["add-button"]);
  }
}

function saveLanguage() {
  disableButtons(["add-button"]);
  var languageName = document.getElementById("language-name").value;
  var flagText = document.getElementById("choose-flag").innerHTML;
  var request = new XMLHttpRequest();

  request.onload = function () {
    window.location.reload(true);
  }

  request.open(
    "GET", "/languages/add_language?name=" + encodeURIComponent(languageName)
    + "&flag=" + encodeURIComponent(flagText)
  );

  request.send();
}

window.addEventListener('load', populateSelectBoxes);
