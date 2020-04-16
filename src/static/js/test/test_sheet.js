function loadSheet() {
  sessionStorage.alreadyAttempted = 0;
  sessionStorage.one_ago = "";
  sessionStorage.two_ago = "";
  sessionStorage.three_ago = "";
  sessionStorage.results = JSON.stringify([]);
  sessionStorage.sheetName = document.getElementById("sheet-name").innerHTML;

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

    drawStars(
      document.getElementById("stars-container"), points + (so_far == 2), true
    );

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
    "GET", "/test_sheet/get_question?sheet="
    + encodeURIComponent(sessionStorage.sheetName), true
  );

  // Sends the request off.
  request.send();
}

window.addEventListener('load', loadSheet);

function updateResults(correct, questionText) {
  results = JSON.parse(sessionStorage.results);
  results.push({"question": questionText, "correct": correct});
  sessionStorage.results = JSON.stringify(results);
}

function onHoverAnswer(row, questionText) {
  var clearCells = document.querySelectorAll(
    "#answers-table td:not(:first-child)"
  );
  for (var i = 0; i < clearCells.length; i ++)
  {
    clearCells[i].remove();
  }

  var trashCell = document.createElement("td");
  trashCell.innerHTML = "️🗑️";
  trashCell.classList.add("trash-can");
  trashCell.onclick = function () {
    deleteAnswer(row, questionText);
  };
  row.appendChild(trashCell);
}

function deleteAnswer(row, questionText) {
  var answerText = row.querySelector("td:first-child").innerHTML;
  row.remove();
  if (document.querySelectorAll("#answers-table tr").length == 0)
  {
    document.getElementById(
      "other-answers-header"
    ).style.visibility = "hidden";
  }

  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();

  request.open(
    "GET", "/test_sheet/remove_answer?sheet="
    + encodeURIComponent(sessionStorage.sheetName) + "&question="
    + encodeURIComponent(questionText) + "&answer="
    + encodeURIComponent(answerText), true
  );

  request.send();
}

function addToAnswers() {
  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();

  var question = document.getElementById("question-text")
  var questionText = question.innerHTML;
  var answerText = document.getElementById("answer-box").value;

  request.onload = function () {
    var wrongAnswerBox = document.getElementById("wrong-answer-box");
    wrongAnswerBox.classList.add("hide");
    correctAnswer(question);
  };

  request.open(
    "GET", "/test_sheet/add_answer?sheet="
    + encodeURIComponent(sessionStorage.sheetName) + "&question="
    + encodeURIComponent(questionText) + "&answer="
    + encodeURIComponent(answerText), true
  );

  request.send();
}

function keyDownOnWrongAnswerContainer(event) {
  // Checks that the escape key was pressed..
  if (event.key == "Escape")
  {
    clickNextButton();
  }
}

function clickNextButton() {
  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();
  var question = document.getElementById("question-text")
  var questionText = question.innerHTML;
  var answerText = document.getElementById("answer-box").value;

  request.onload = function () {
    var wrongAnswerBox = document.getElementById("wrong-answer-box");
    wrongAnswerBox.classList.add("hide");
    proceed(questionText);
  };

  updateResults(false, questionText);

  request.open(
    "GET", "/test_sheet/incorrect_answer?sheet="
    + encodeURIComponent(sessionStorage.sheetName) + "&question="
    + encodeURIComponent(questionText), true
  );

  request.send();
}

function abortTest() {
  if (sessionStorage.one_ago)
  {
    window.location.href = '/results';
  }
  else
  {
    window.location.href = '/test'
  }
}

function proceed(questionText) {
  sessionStorage.three_ago = sessionStorage.two_ago;
  sessionStorage.two_ago = sessionStorage.one_ago;
  sessionStorage.one_ago = questionText;

  var questionNumberPanel = document.getElementById("testbar-center-text");
  var numbers = questionNumberPanel.innerHTML.split(' / ');
  var current = Number(numbers[0]);
  var final = Number(numbers[1]);
  if (current == final)
  {
    window.location.href = "/results";
    return;
  }
  questionNumberPanel.innerHTML = (current + 1) + " / " + final;

  // Prepares a request to find out whether the answer is correct.
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

    drawStars(
      document.getElementById("stars-container"), points + (so_far == 2), true
    );

    // Calculates the percentage complete.
    var percent = Math.round(so_far / needed * 100);

    var barChart = document.querySelector(".bar-chart");
    var barChartFigure = document.querySelector(".bar-chart-figure");

    barChart.style.width = percent + "%";
    barChartFigure.innerHTML = percent + "% complete";

    // Identifies the text box for the answer.
    var textArea = document.getElementById("answer-box");
    textArea.value = "";
    textArea.disabled = false;

    // Focuses on the answer box.
    textArea.focus();
  };

  var previous = JSON.stringify([
    sessionStorage.one_ago, sessionStorage.two_ago, sessionStorage.three_ago
  ]);

  request.open(
    "GET", "/test_sheet/get_question?sheet="
    + encodeURIComponent(sessionStorage.sheetName) + "&previous="
    + encodeURIComponent(previous), true
  );

  request.send();
}

function noHoverAnswer(row) {
  var clearCells = row.querySelectorAll(":not(:first-child)");
  for (var i = 0; i < clearCells.length; i ++)
  {
    clearCells[i].remove();
  }
}

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

function correctAnswer(question) {
  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();

  var questionText = question.innerHTML;
  question.innerHTML = "Correct!";

  document.getElementById("correct-sound").play();

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
        proceed(questionText);
      }
    }, 10);
  };

  updateResults(true, questionText);

  request.open(
    "GET", "/test_sheet/correct_answer?sheet="
    + encodeURIComponent(sessionStorage.sheetName) + "&question="
    + encodeURIComponent(questionText), true
  );

  // Sends the request off.
  request.send();

  sessionStorage.alreadyAttempted = 0;
}

function wrongAnswer(question, textArea, closest, others) {
  var questionText = question.innerHTML;
  var attemptedAnswer = textArea.value;

  document.getElementById("wrong-sound").play();

  document.getElementById("failed-question").innerHTML = questionText;
  document.getElementById("wrong-answer").innerHTML = attemptedAnswer;
  document.getElementById("right-answer").innerHTML = closest;

  var otherAnswers = document.querySelector("#answers-table>.main-rows");
  otherAnswers.innerHTML = "";

  if (others.length == 0)
  {
    document.getElementById(
      "other-answers-header"
    ).style.visibility = "hidden";
  }
  else
  {
    document.getElementById(
      "other-answers-header"
    ).style.visibility = "visible";
  }

  for (var i = 0; i < others.length; i ++)
  {
    var newRow = document.createElement("tr");
    var answerCell = document.createElement("td");
    answerCell.innerHTML = others[i];
    newRow.appendChild(answerCell);
    newRow.onmouseenter = function () {
      onHoverAnswer(this, questionText);
    };
    newRow.onmouseleave = function () {
      noHoverAnswer(this);
    };
    otherAnswers.appendChild(newRow);
  }

  var wrongAnswerBox = document.getElementById("wrong-answer-box");
  var nextButton = document.getElementById("next-button");
  wrongAnswerBox.classList.remove("hide");
  nextButton.focus();
}

function go() {
  // Prepares a request to find out whether the answer is correct.
  var request = new XMLHttpRequest();

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
      correctAnswer(question);
    }
    else if (returnJSON["close"] && sessionStorage.alreadyAttempted == 0)
    {
      tryAgain(button, textArea);
      return;
    }
    else
    {
      wrongAnswer(
        question, textArea, returnJSON["closest"], returnJSON["others"]
      );
    }
  };

  request.open(
    "GET", "/test_sheet/check_answer?sheet="
    + encodeURIComponent(sessionStorage.sheetName) + "&question="
    + encodeURIComponent(question.innerHTML) + "&answer="
    + encodeURIComponent(textArea.value) + "&already_attempted="
    + encodeURIComponent(sessionStorage.alreadyAttempted)
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
