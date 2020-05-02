function selectTranslator(from_l, to_l) {
  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  // Prepares to recreate the search result table.
  request.onload = function() {
    if (document.location.href.endsWith('/languages'))
    {
      document.location = '/';
    }
    else
    {
      document.location.reload();
    }
  };

  // Points the request at the appropriate command.
  request.open("GET", "/languages/set?from=" + from_l + "&to=" + to_l, true);

  // Sends the request off.
  request.send();
}

function clickTopButton(element) {
  if (element.innerHTML.trim() == "Start!")
  {
    window.location.href = "/languages";
  }
  else
  {
    window.location.reload();
  }
}
