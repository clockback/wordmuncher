function loadSheet() {
  sessionStorage.alreadyAttempted = 0;

  // Grabs the name of the sheet.
  var sheetName = document.getElementById("sheet-name").innerHTML;

  // Prepares a request for the search function.
  var request = new XMLHttpRequest();

  request.onload = function () {
    // Collect values from request.
    var returnJSON = JSON.parse(request.responseText);
    var question = returnJSON["question"];
    var points = returnJSON["points"];
    var needed = returnJSON["needed"];
    var so_far = returnJSON["so_far"];

    // Set the question text.
    document.getElementById("question-text").innerHTML = question;

    // Calculates the percentage complete.
    var percent = Math.round(so_far / needed * 100);

    var barChart = document.querySelector(".bar-chart");
    var barChartFigure = document.querySelector(".bar-chart-figure");

    barChart.style.width = percent + "%";
    barChartFigure.innerHTML = percent + "% complete";

    // Focuses on the answer box.
    document.getElementById("answer-box").focus();

    // Reveal test.
    document.getElementById("hide-screen").style.visibility = "hidden";
  }

  // Points the request at the appropriate command.
  request.open(
    "GET", "/test_sheet/get_question?sheet=" + encodeURIComponent(sheetName),
    true
  );

  // Sends the request off.
  request.send();
}

window.addEventListener('load', loadSheet);

function tryAgain(button, textArea) {
  // Identifies the drop down to try again.
  var tryAgainMessage = document.getElementById("try-again");

  tryAgainMessage.style.visibility = null;
  var pos = 20;
  var time = 0;
  tryAgainMessage.style.top = 0;

  var showAlert = setInterval(
    function () {
      time ++;

      // Stops iterating if player has done something else.
      if (sessionStorage.alreadyAttempted != 1)
      {
        pos = 20;
        tryAgainMessage.style.visibility = "hidden";
        clearInterval(showAlert);
      }
      else if (time <= 30)
      {
        pos ++;
      }
      else if (pos > 20 && time >= 200)
      {
        pos --;
      }
      else if (time >= 200 && pos <= 20)
      {
        tryAgainMessage.style.visibility = "hidden";
        clearInterval(showAlert);
      }
      tryAgainMessage.style.top = pos + "px";
    }, 15
  );

  button.onclick = go;
  button.classList.remove("button-disabled");
  textArea.disabled = false;
  textArea.focus();
  sessionStorage.alreadyAttempted = 1;
}

function correctAnswer(sheetName, question) {
  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();

  var questionText = question.innerHTML;
  question.innerHTML = "Correct!";

  request.onload = function () {
    var returnJSON = JSON.parse(request.responseText);

    var endPercentage = Math.round(
      returnJSON["so_far"] / returnJSON["needed"] * 100
    );

    var time = 0;
    var percentageBar = document.querySelector(".bar-chart");
    var percentageBarFigure = document.querySelector(".bar-chart-figure");
    var startPercentage = parseInt(percentageBar.style.width);
    var diff = endPercentage - startPercentage;
    var updatePercentage = setInterval(function () {
      time ++;
      if (time < 100)
      {
        var weight = 1 / (1 + Math.exp(0.075 * (50 - time)));
      }
      else
      {
        var weight = 1;
      }
      presentPercentage = Math.round(startPercentage + diff * weight) + "%";
      percentageBar.style.width = presentPercentage;
      percentageBarFigure.innerHTML = presentPercentage + " complete";
      if (time == 100)
      {
        clearInterval(updatePercentage);
      }
    }, 10);
  };

  request.open(
    "GET", "/test_sheet/correct_answer?sheet=" + encodeURIComponent(sheetName)
    + "&question=" + encodeURIComponent(questionText), true
  );

  // Sends the request off.
  request.send();

  sessionStorage.alreadyAttempted = 0;
}

function go() {
  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();

  // Grabs the name of the sheet.
  var sheetName = document.getElementById("sheet-name").innerHTML;

  // Identifies the question.
  var question = document.getElementById("question-text");

  // Identifies the text box for the answer.
  var textArea = document.getElementById("answer-box");

  // Identifies the go button.
  var button = document.getElementById("go-button");
  button.onclick = null;
  textArea.disabled = true;
  button.classList.add("button-disabled");

  request.onload = function () {
    var returnJSON = JSON.parse(request.responseText);

    // If the answer was almost correct, but not enough.
    if (returnJSON["correct"])
    {
      correctAnswer(sheetName, question);
    }
    else if (
      !returnJSON["correct"] && returnJSON["close"]
      && sessionStorage.alreadyAttempted == 0
    )
    {
      tryAgain(button, textArea);
      return;
    }
  };

  request.open(
    "GET", "/test_sheet/check_answer?sheet=" + encodeURIComponent(sheetName)
    + "&question=" + encodeURIComponent(question.innerHTML) + "&answer="
    + encodeURIComponent(textArea.value)
  );

  // Sends the request off.
  request.send();

}

function hitEnterAnswerBox(element, event) {
  if (event.key == "Enter" && element.value != "")
  {
    go();
  }
}

function typeAnswerBox(element, event) {
  var goButton = document.getElementById("go-button");

  // Prevents the enter key from being typed if empty.
  if (event.data == null && element.value == "\n")
  {
    element.value = "";
  }

  if (element.value.length == 0)
  {
    goButton.classList.add("button-disabled");
    goButton.onclick = null;
  }
  else
  {
    goButton.classList.remove("button-disabled");
    goButton.onclick = go;
  }
}
