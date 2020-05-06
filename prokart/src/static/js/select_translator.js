function selectTranslator(from_l, to_l) {
  openRequest("/languages/set", [
    ["from", from_l], ["to", to_l]
  ], processSelectTranslator);
}

function processSelectTranslator(request) {
  if (document.location.href.endsWith('/languages')) {
    document.location = '/';
  }
  else {
    document.location.reload();
  }
}

function clickTopButton(element) {
  if (element.innerHTML.trim() == "Start!") {
    window.location.href = "/languages";
  }
  else {
    window.location.reload();
  }
}
