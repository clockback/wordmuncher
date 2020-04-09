window.addEventListener('load', function() {
  var selectDiv, i, j, selectElement, selectedOption, hiddenOptions,
    hiddenOption;

  // Look for any elements with the class "custom-select":
  selectDiv = document.getElementsByClassName("custom-select");
  for (i = 0; i < selectDiv.length; i++) {
    selectElement = selectDiv[i].getElementsByTagName("select")[0];

    // For each element, create a new DIV that will act as the selected item:
    selectedOption = document.createElement("DIV");
    selectedOption.setAttribute("class", "select-selected");
    selectedOption.innerHTML = selectElement.options[
      selectElement.selectedIndex
    ].innerHTML;
    selectDiv[i].appendChild(selectedOption);

    // For each element, create a new DIV that will contain the option list:
    hiddenOptions = document.createElement("DIV");
    hiddenOptions.setAttribute("class", "select-items select-hide");
    for (j = 1; j < selectElement.length; j++) {

      /* For each option in the original select element, create a new DIV that
      will act as an option item: */
      hiddenOption = document.createElement("DIV");
      hiddenOption.innerHTML = selectElement.options[j].innerHTML;
      hiddenOption.addEventListener("click", function(e) {

        /* When an item is clicked, update the original select box, and the
        selected item: */
        var repeatOption, i, k, selectNode, selectedNode;
        selectNode = this.parentNode.parentNode.getElementsByTagName(
          "select"
        )[0];
        selectedNode = this.parentNode.previousSibling;
        for (i = 0; i < selectNode.length; i++) {
          if (selectNode.options[i].innerHTML == this.innerHTML) {
            selectNode.selectedIndex = i;
            selectedNode.innerHTML = this.innerHTML;
            repeatOption = this.parentNode.getElementsByClassName(
              "same-as-selected"
            );
            for (k = 0; k < repeatOption.length; k++) {
              repeatOption[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        selectedNode.click();
      });
      hiddenOptions.appendChild(hiddenOption);
    }
    selectDiv[i].appendChild(hiddenOptions);
    selectedOption.addEventListener("click", function(e) {

      /* When the select box is clicked, close any other select boxes, and
      open/close the current select box: */
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
  }
  function closeAllSelect(element) {
    /* A function that will close all select boxes in the document, except the
    current select box: */
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

  /* If the user clicks anywhere outside the select box, then close all select
  boxes: */
  document.addEventListener("click", closeAllSelect);
})
