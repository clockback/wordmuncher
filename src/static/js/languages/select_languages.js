window.addEventListener('load', function() {
  // Finds the two translate buttons once the page has loaded.
  var items, i;
  items = document.querySelectorAll(
    "#translate_from .select-items>div,#translate_to .select-items>div"
  );
  for (i = 0; i < items.length; i++) {

    // Binds the selectLanguage function to them both.
    items[i].addEventListener("click", selectLanguage);
  }
});

function selectLanguage() {
  if (document.querySelectorAll(
    "#translate_from .same-as-selected,#translate_to .same-as-selected"
  ).length == 2)
  {
    saveButton = document.querySelector("#save_button>button");
    saveButton.classList.remove("button-disabled");
    saveButton.setAttribute(
      "onclick", "this.parentNode.parentNode.submit()"
    );
  }
}
