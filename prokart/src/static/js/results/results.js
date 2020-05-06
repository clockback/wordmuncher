function loadResults() {
  results = JSON.parse(sessionStorage.results);

  // Prepares to find the total score and total number of questions
  // answered.
  var total_score = 0;

  // Collects each response by whichever question to which it was
  // addressed.
  var cumulative_results = {};
  var questions = [];

  for (var i = 0; i < results.length; i ++) {
    var result = results[i];
    if (result["correct"]) {
      total_score ++;
    }

    if (!(result["question"] in cumulative_results)) {
      questions.push(result["question"]);
      cumulative_results[result["question"]] = {true: 0, false: 0};
    }
    cumulative_results[result["question"]][result["correct"]] ++;
  }

  // Updates the displayed score.
  var scoreElement = getById("final-score");
  scoreElement.innerHTML = total_score + " / " + results.length;

  populateResultsTable(cumulative_results, questions);
}

function populateResultsTable(results, questions) {
  var questionsString = JSON.stringify(questions);
  openRequest("/results/summary_table", [
    ["sheet", sessionStorage.sheetName], ["questions", questionsString]
  ], processPopulateResultsTable);
}

function processPopulateResultsTable(request) {
  var returnJSON = JSON.parse(request.responseText);
  var resultsTable = getById("results-table");

  var entries = returnJSON["entries"];

  for (var i = 0; i < questions.length; i ++) {
    var scores = entries[questions[i]];

    var newRow = document.createElement("tr");
    if (scores[0] == 2 && scores[1] == 2) {
      newRow.classList.add("completed-colour");
    }
    else if (scores[0] > 0) {
      newRow.classList.add("incomplete-colour");
    }
    else {
      newRow.classList.add("failed-colour");
    }

    var questionCell = document.createElement("td");
    questionCell.innerHTML = questions[i];

    var correctCell = document.createElement("td");
    correctCell.innerHTML = results[questions[i]][true];

    var incorrectCell = document.createElement("td");
    incorrectCell.innerHTML = results[questions[i]][false];

    var starsCell = document.createElement("td");
    drawStars(starsCell, scores[2] + (scores[0] == 2));

    newRow.appendChild(questionCell);
    newRow.appendChild(correctCell);
    newRow.appendChild(incorrectCell);
    newRow.appendChild(starsCell);
    resultsTable.appendChild(newRow);
  }
}

window.addEventListener('load', loadResults);
