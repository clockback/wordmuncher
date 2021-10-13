import {
    bindButtonKeyPressEvents, decorateEventFunction, decorateFunction,
    disableAllTabbables, disableButtons, enableAllTabbables, enableButtons,
    getById, hide, openRequest, unhide
} from '../utils.js';
import {drawStars} from '../stars.js';

function loadSheet() {
    sessionStorage.alreadyAttempted = 0;
    sessionStorage.one_ago = "";
    sessionStorage.two_ago = "";
    sessionStorage.three_ago = "";
    sessionStorage.results = JSON.stringify([]);
    sessionStorage.sheetName = getById("sheet-name").innerHTML;

    openRequest("/test_sheet/get_question", [
        ["sheet", sessionStorage.sheetName]
    ], processLoadSheet);
}

function processLoadSheet(request) {
    // Collect values from request.
    var returnJSON = JSON.parse(request.responseText);
    var question = returnJSON["question"];
    var answers = returnJSON["answers"];
    var points = returnJSON["points"];
    var needed = returnJSON["needed"];
    var so_far = returnJSON["so_far"];

    if (answers !== null) {
        prepareTable(answers);
    }
    else {
        getById("answer-table").classList.add("hide");
    }

    // Set the question text.
    getById("question-text").innerHTML = question;

    // Draws the appropriate number of stars for the question.
    drawStars(
        getById("stars-container"), points + (so_far == 2), true
    );

    // Calculates the percentage complete.
    var percent = Math.round(so_far / needed * 100);

    var barChart = document.querySelector(".bar-chart");
    var barChartFigure = document.querySelector(".bar-chart-figure");

    barChart.style.width = percent + "%";
    barChartFigure.innerHTML = percent + "% complete";

    // Focuses on the answer box.
    getById("answer-box").focus();

    // Reveal test.
    getById("hide-screen").style.visibility = "hidden";
}

window.addEventListener('load', loadSheet);

function updateResults(correct, questionText) {
    var results = JSON.parse(sessionStorage.results);
    results.push({"question": questionText, "correct": correct});
    sessionStorage.results = JSON.stringify(results);
}

function onHoverAnswer(questionText) {
    var clearCells = document.querySelectorAll(
        "#answers-table td:not(:first-child)"
    );
    for (var i = 0; i < clearCells.length; i ++) {
        clearCells[i].remove();
    }

    var trashCell = document.createElement("td");
    trashCell.innerHTML = "️🗑️";
    trashCell.classList.add("trash-can");
    trashCell.onclick = decorateFunction(deleteAnswer, questionText);
    this.appendChild(trashCell);
}

function deleteAnswer(questionText) {
    var answerText = this.querySelector("td:first-child").innerHTML;
    this.remove();
    if (document.querySelectorAll("#answers-table tr").length == 0) {
        getById("other-answers-header").style.visibility = "hidden";
    }

    openRequest("/test_sheet/remove_answer", [
        ["sheet", sessionStorage.sheetName], ["question", questionText],
        ["answer", answerText]
    ]);
}

function addToAnswers() {
    var question = getById("question-text");
    var questionText = question.innerHTML;
    var answer = getById("answer-box").value;

    openRequest("/test_sheet/add_answer", [
        ["sheet", sessionStorage.sheetName], ["question", questionText],
        ["answer", answer]
    ], processAddToAnswers, question);
}

function processAddToAnswers(request, question) {
    hide(["wrong-answer-box"]);

    enableAllTabbables("main");
    enableAllTabbables("testbar");
    disableAllTabbables("wrong-answer-box");

    correctAnswer(question);
}

function keyDownOnWrongAnswerContainer(event) {
    // Checks that the escape key was pressed..
    if (event.key == "Escape") {
        clickNextButton();
    }
}

function clickNextButton() {
    var question = getById("question-text")
    var questionText = question.innerHTML;

    updateResults(false, questionText);

    openRequest("/test_sheet/incorrect_answer", [
        ["sheet", sessionStorage.sheetName], ["question", questionText]
    ], processClickNextButton, questionText);
}

function processClickNextButton(request, questionText) {
    hide(["wrong-answer-box"]);

    enableAllTabbables("main");
    enableAllTabbables("testbar");
    disableAllTabbables("wrong-answer-box");

    proceed(questionText, false);
}

function abortTest() {
    if (sessionStorage.one_ago) {
        window.location.href = '/results';
    }
    else {
        window.location.href = '/test'
    }
}

function proceed(questionText, forceEnd) {
    sessionStorage.three_ago = sessionStorage.two_ago;
    sessionStorage.two_ago = sessionStorage.one_ago;
    sessionStorage.one_ago = questionText;

    var questionNumberPanel = getById("testbar-center-text");
    var numbers = questionNumberPanel.innerHTML.split(' / ');
    var current = Number(numbers[0]);
    var final = Number(numbers[1]);

    if (current == final || forceEnd) {
        window.location.href = "/results";
        return;
    }

    questionNumberPanel.innerHTML = (current + 1) + " / " + final;

    var table = document.querySelector("#answer-table>tbody");
    while (table.lastChild) {
        table.removeChild(table.lastChild);
    }

    var previous = JSON.stringify([
        sessionStorage.one_ago, sessionStorage.two_ago,
        sessionStorage.three_ago
    ]);

    openRequest("/test_sheet/get_question", [
        ["sheet", sessionStorage.sheetName], ["previous", previous]
    ], processProceed);
}

function processProceed(request) {
    // Collect values from request.
    var returnJSON = JSON.parse(request.responseText);
    var question = returnJSON["question"];
    var answers = returnJSON["answers"]
    var points = returnJSON["points"];
    var needed = returnJSON["needed"];
    var so_far = returnJSON["so_far"];
    var subschemas = returnJSON["subschemas"];
    var qualities = returnJSON["qualities"];

    // Set the question text.
    getById("question-text").innerHTML = question;

    drawStars(
        getById("stars-container"), points + (so_far == 2), true
    );

    // Calculates the percentage complete.
    var percent = Math.round(so_far / needed * 100);

    var barChart = document.querySelector(".bar-chart");
    var barChartFigure = document.querySelector(".bar-chart-figure");

    barChart.style.width = percent + "%";
    barChartFigure.innerHTML = percent + "% complete";

    // Identifies the text box for the answer.
    var textArea = getById("answer-box");
    textArea.value = "";
    textArea.disabled = false;

    if (answers === null) {
        document.querySelector(".textarea-container").classList.remove("hide");
        document.querySelector(".answer-area").classList.remove(
            "answer-area-with-table"
        );
        getById("answer-table").classList.add("hide");
    }
    else {
        getById("answer-table").classList.remove("hide");
        prepareTable(answers);
    }

    // Focuses on the answer box.
    textArea.focus();
}

function noHoverAnswer() {
    var clearCells = this.querySelectorAll(":not(:first-child)");
    for (var i = 0; i < clearCells.length; i ++) {
        clearCells[i].remove();
    }
}

function tryAgain(textArea) {
    // Identifies the drop down to try again.
    var tryAgainMessage = getById("try-again");

    tryAgainMessage.style.visibility = null;
    var pos = 20;
    var time = 0;
    tryAgainMessage.style.top = 0;

    var showAlert = setInterval(function () {
        time ++;

        // Stops iterating if player has done something else.
        if (sessionStorage.alreadyAttempted != 1) {
            pos = 20;
            tryAgainMessage.style.visibility = "hidden";
            clearInterval(showAlert);
        }
        else if (time <= 30) {
            pos ++;
        }
        else if (pos > 20 && time >= 200) {
            pos --;
        }
        else if (time >= 200 && pos <= 20) {
            tryAgainMessage.style.visibility = "hidden";
            clearInterval(showAlert);
        }
        tryAgainMessage.style.top = pos + "px";
    }, 15);

    enableButtons([["go-button", go]]);
    textArea.disabled = false;
    textArea.focus();
    sessionStorage.alreadyAttempted = 1;
}

function correctAnswer(question) {
    var questionText = question.innerHTML;
    question.innerHTML = "Correct!";

    getById("correct-sound").play();

    updateResults(true, questionText);

    sessionStorage.alreadyAttempted = 0;

    openRequest("/test_sheet/correct_answer", [
        ["sheet", sessionStorage.sheetName], ["question", questionText]
    ], processCorrectAnswer, questionText);
}

function processCorrectAnswer(request, questionText) {
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
        if (time < 100) {
            var weight = 1 / (1 + Math.exp(0.075 * (50 - time)));
        }
        else {
            var weight = 1;
        }
        var presentPercentage = Math.round(
            startPercentage + diff * weight
        ) + "%";
        percentageBar.style.width = presentPercentage;
        percentageBarFigure.innerHTML = presentPercentage + " complete";
        if (time == 100) {
            clearInterval(updatePercentage);

            if (returnJSON["completed"]) {
                unhide(["finished-sheet-box"]);
                disableAllTabbables("main");
                disableAllTabbables("testbar");
                enableAllTabbables("finished-sheet-box");

                sessionStorage.nextQuestion = questionText;
                getById("stop-test").focus();
            }
            else {
                proceed(questionText, false);
            }
        }
    }, 10);
}

function wrongAnswer(question, textArea, closest, others) {
    var questionText = question.innerHTML;
    var attemptedAnswer = textArea.value;

    getById("wrong-sound").play();

    getById("failed-question").innerHTML = questionText;
    getById("wrong-answer").innerHTML = attemptedAnswer;
    getById("right-answer").innerHTML = closest;

    var otherAnswers = document.querySelector("#answers-table>.main-rows");
    otherAnswers.innerHTML = "";

    if (others.length == 0) {
        getById("other-answers-header").style.visibility = "hidden";
    }
    else {
        getById("other-answers-header").style.visibility = "visible";
    }

    for (var i = 0; i < others.length; i ++) {
        var newRow = document.createElement("tr");
        var answerCell = document.createElement("td");
        answerCell.innerHTML = others[i];
        newRow.appendChild(answerCell);
        newRow.onmouseenter = decorateEventFunction(
            onHoverAnswer, questionText
        );
        newRow.onmouseleave = noHoverAnswer;
        otherAnswers.appendChild(newRow);
    }

    unhide(["wrong-answer-box"]);

    disableAllTabbables("main");
    disableAllTabbables("testbar");
    enableAllTabbables("wrong-answer-box");

    getById("next-button").focus();
}

function go() {
    // Identifies the question.
    var question = getById("question-text");

    // Disables the go button.
    disableButtons(["go-button"]);

    var schemaAnswer = !getById("answer-table").classList.contains("hide");
    var sendAnswer;

    // Identifies the text box for the answer.
    var textArea = getById("answer-box");

    if (schemaAnswer) {
        var inputs = document.getElementsByTagName("input");

        sendAnswer = {};

        for (var i = 0; i < inputs.length; i ++) {
            var input = inputs[i];
            input.disabled = true;

            var inputDiv = input.parentNode;
            inputDiv.classList.add("input-box-disabled");

            var cell = inputDiv.parentNode;
            var columnQuality = cell.getAttribute("data-col");
            var rowQuality = cell.getAttribute("data-row");

            if (sendAnswer[columnQuality] === undefined) {
                if (rowQuality === null) {
                    sendAnswer[columnQuality] = input.value;
                }
                else {
                    sendAnswer[columnQuality] = {[rowQuality]: input.value}
                }
            }
            else {
                sendAnswer[columnQuality][rowQuality] = input.value;
            }
        }

        sendAnswer = JSON.stringify(sendAnswer);
    }
    else {
        textArea.disabled = true;
        sendAnswer = textArea.value;
    }

    openRequest("/test_sheet/check_answer", [
        ["sheet", sessionStorage.sheetName], ["question", question.innerHTML],
        ["answer", sendAnswer],
        ["already_attempted", sessionStorage.alreadyAttempted]
    ], processGo, question, textArea);
}

function processGo(request, question, textArea) {
    var returnJSON = JSON.parse(request.responseText);

    // If the answer was almost correct, but not enough.
    if (returnJSON["correct"]) {
        correctAnswer(question);
        return;
    }

    if (returnJSON["corrections"].length > 0) {
        if (returnJSON["close"] && sessionStorage.alreadyAttempted == 0) {
            tryAgainTable(returnJSON["corrections"]);
        }
        else {
            wrongAnswerTable(returnJSON["corrections"]);
        }
    }
    else if (returnJSON["close"] && sessionStorage.alreadyAttempted == 0) {
        tryAgain(textArea);
        return;
    }
    else {
        wrongAnswer(
            question, textArea, returnJSON["closest"], returnJSON["others"]
        );
    }
}

function hitEnterAnswerBox() {
    if (event.key == "Enter" && this.value != "") {
        go();
    }
}

function typeAnswerBox() {
    // Prevents the enter key from being typed if empty.
    if (event.data == null && this.value == "\n") {
        this.value = "";
    }

    if (this.value.length == 0) {
        disableButtons(["go-button"]);
    }
    else {
        enableButtons([["go-button", go]]);
    }
}

function updateNoQuestions() {
    getById("testbar-center-text").innerHTML = (
        "1 / " + sessionStorage.noQuestions
    );
}

function stopTestEarly() {
    hide(["finished-sheet-box"]);
    proceed(sessionStorage.questionText, true);
}

function continueTest() {
    hide(["finished-sheet-box"]);
    disableAllTabbables("finished-sheet-box");
    enableAllTabbables("main");
    enableAllTabbables("testbar");

    proceed(sessionStorage.questionText, false);
}

function typeAnswerInTable() {
    var inputs = document.getElementsByTagName("input");
    var populated = true;

    for (var i = 0; i < inputs.length; i ++) {
        if (inputs[i].value == "") {
            populated = false;
            break;
        }
    }

    if (populated) {
        enableButtons([["go-button", go]]);
    }
    else {
        disableButtons(["go-button"]);
    }
}

function hitKeyAnswerInTable(event) {
    if (event.key == "Enter") {

        var inputs = document.getElementsByTagName("input");
        var populated = true;

        for (var i = 0; i < inputs.length; i ++) {
            if (inputs[i].value == "") {
                populated = false;
                break;
            }
        }

        if (populated) {
            go();
        }
    }
}

function wrongAnswerTable(corrections) {
    getById("wrong-sound").play();

    var question = getById("question-text")
    var questionText = question.innerHTML;

    updateResults(false, questionText);

    var inputs = document.getElementsByTagName("input");
    for (var i = 0; i < inputs.length; i ++) {
        var input = inputs[i];
        var cell = input.parentNode.parentNode;

        var dataCol = cell.getAttribute("data-col");
        var dataRow = cell.getAttribute("data-row");

        for (var j = 0; j < corrections.length; j ++) {
            var correction = corrections[j];

            if (dataCol == correction[0] && (
                dataRow === null || dataRow == correction[1]
            )) {
                var correctionDiv = document.createElement("div");
                correctionDiv.innerHTML = correction[correction.length - 1];
                correctionDiv.classList.add("correction-text");
                input.parentNode.classList.add("incorrect");
                cell.appendChild(correctionDiv);
            }
        }
    }

    var time = 0;
    var percentageBar = document.querySelector(".bar-chart");
    var percentageBarFigure = document.querySelector(".bar-chart-figure");
    var startPercentage = parseInt(percentageBar.style.width);
    var diff = -startPercentage;

    var updatePercentage = setInterval(function () {
        time ++;
        if (time < 100) {
            var weight = 1 / (1 + Math.exp(0.075 * (50 - time)));
        }
        else {
            var weight = 1;
        }
        presentPercentage = Math.round(startPercentage + diff * weight) + "%";
        percentageBar.style.width = presentPercentage;
        percentageBarFigure.innerHTML = presentPercentage + " complete";
        if (time == 100) {
            clearInterval(updatePercentage);

            var goButton = getById("go-button");
            goButton.innerHTML = "Next"
            enableButtons([[goButton, decorateFunction(
                proceed, questionText, false
            )]])
        }
    }, 10);
}

function prepareTable(answers) {
    document.querySelector(".textarea-container").classList.add("hide");
    document.querySelector(".answer-area").classList.add(
        "answer-area-with-table"
    );

    var schemaTable = document.querySelector("#answer-table>tbody");

    var columnsSubschemaNameRow = document.createElement("tr");
    schemaTable.appendChild(columnsSubschemaNameRow);

    if (answers["rows"] !== null) {
        var placeHolder = document.createElement("td");
        placeHolder.colSpan = 2;
        placeHolder.rowSpan = 2;
        placeHolder.classList.add("placeholder-cell");
        columnsSubschemaNameRow.appendChild(placeHolder);
    }

    var columnsHeader = document.createElement("th");
    columnsHeader.innerHTML = answers["columns"];
    columnsHeader.style.textAlign = "center";
    columnsHeader.colSpan = answers["column names"].length;
    columnsSubschemaNameRow.appendChild(columnsHeader);

    var columnsSubschemaRow = document.createElement("tr");
    schemaTable.appendChild(columnsSubschemaRow);

    for (var i = 0; i < answers["column names"].length; i ++) {
        var columnHeader = document.createElement("th");
        columnHeader.innerHTML = answers["column names"][i];
        columnsSubschemaRow.appendChild(columnHeader);
    }

    if (answers["rows"] === null) {
        var singleAnswerRow = document.createElement("tr");
        schemaTable.appendChild(singleAnswerRow);

        for (var i = 0; i < answers["column names"].length; i ++) {
            var emptyCell = document.createElement("td");
            singleAnswerRow.appendChild(emptyCell);
            emptyCell.setAttribute("data-col", answers["column ids"][i]);

            if (answers["answer_locations"].includes(i)) {
                var divForEntry = document.createElement("div");
                divForEntry.classList.add("input-box");
                divForEntry.classList.add("short-input");
                emptyCell.appendChild(divForEntry);
                var entry = document.createElement("input");
                entry.oninput = typeAnswerInTable;
                entry.onkeypress = hitKeyAnswerInTable;
                divForEntry.appendChild(entry);
            }
        }
    }

    else {
        for (var i = 0; i < answers["row names"].length; i ++) {
            var row = document.createElement("tr");
            schemaTable.appendChild(row);
            if (i == 0) {
                var rowsHeader = document.createElement("th");
                rowsHeader.innerHTML = answers["rows"];
                rowsHeader.rowSpan = answers["row names"].length;
                row.appendChild(rowsHeader);
            }

            var rowHeader = document.createElement("th");
            rowHeader.innerHTML = answers["row names"][i];
            row.appendChild(rowHeader);

            for (var j = 0; j < answers["column names"].length; j ++) {
                var emptyCell = document.createElement("td");
                row.appendChild(emptyCell);
                emptyCell.setAttribute("data-col", answers["column ids"][j]);
                emptyCell.setAttribute("data-row", answers["row ids"][i]);

                for (var k = 0; k < answers["answer_locations"].length; k ++) {
                    var position = answers["answer_locations"][k];
                    if (position[0] == j && position[1] == i) {
                        var divForEntry = document.createElement("div");
                        divForEntry.classList.add("input-box");
                        divForEntry.classList.add("short-input");
                        emptyCell.appendChild(divForEntry);
                        var entry = document.createElement("input");
                        entry.oninput = typeAnswerInTable;
                        entry.onkeypress = hitKeyAnswerInTable;
                        divForEntry.appendChild(entry);
                        break;
                    }
                }
            }
        }
    }
}

function tryAgainTable(answers) {
    // Identifies the drop down to try again.
    var tryAgainMessage = getById("try-again");

    tryAgainMessage.style.visibility = null;
    var pos = 20;
    var time = 0;
    tryAgainMessage.style.top = 0;

    var showAlert = setInterval(function () {
        time ++;

        // Stops iterating if player has done something else.
        if (sessionStorage.alreadyAttempted != 1) {
            pos = 20;
            tryAgainMessage.style.visibility = "hidden";
            clearInterval(showAlert);
        }
        else if (time <= 30) {
            pos ++;
        }
        else if (pos > 20 && time >= 200) {
            pos --;
        }
        else if (time >= 200 && pos <= 20) {
            tryAgainMessage.style.visibility = "hidden";
            clearInterval(showAlert);
        }
        tryAgainMessage.style.top = pos + "px";
    }, 15);

    var inputs = document.getElementsByTagName("input");

    for (var i = 0; i < inputs.length; i ++) {
        var input = inputs[i];
        var cell = input.parentNode.parentNode;

        var dataCol = cell.getAttribute("data-col");
        var dataRow = cell.getAttribute("data-row");

        for (var j = 0; j < answers.length; j ++) {
            var answer =  answers[j];

            if (dataCol == answer[0] && (
                dataRow === null || dataRow == answer[1]
            )) {
                input.disabled = false;
                input.parentNode.classList.remove("input-box-disabled");
            }
        }
    }

    sessionStorage.alreadyAttempted = 1;
}

function keyDownOnFinishedSheetContainer() {
    // Checks that the escape key was pressed..
    if (event.key == "Escape") {
        continueTest();
    }
}

function prepareEventsTestSheet() {
    getById("answer-box").onkeypress = hitEnterAnswerBox;
    getById("answer-box").oninput = typeAnswerBox;
    getById("finished-sheet-box").onkeydown = keyDownOnFinishedSheetContainer;
    getById("close-finished-sheet-box").onclick = continueTest;
    getById("stop-test").onclick = stopTestEarly;
    getById("continue-test").onclick = continueTest;
    getById("wrong-answer-box").onkeydown = keyDownOnWrongAnswerContainer;
    getById("next-button").onclick = clickNextButton;
    getById("add-to-answers-button").onclick = addToAnswers;
    var backButton = document.querySelector("#testbar-left>span");
    backButton.onclick = abortTest;
    bindButtonKeyPressEvents(backButton, abortTest);
    document.querySelector("#wrong-answer-box .title-bar>div").onclick = (
        clickNextButton
    );
}

window.addEventListener('load', prepareEventsTestSheet);
window.addEventListener('load', updateNoQuestions);
