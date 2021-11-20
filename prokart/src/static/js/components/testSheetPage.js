import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import TestBar from './testBar.js';
import {addMessageListener} from '../sql/messageListener.js';
import Footer from './footer.js';
import WrongAnswerBox from './wrongAnswerBox.js';
import correct from '../../audio/correct.mp3';
import incorrect from '../../audio/incorrect.mp3';
import starImage from '../../images/star.svg'


async function getTestEntry(lastEntries, loadEntry) {
    let worker = new Worker(
        new URL('../sql/getTestEntry.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        sheet: sessionStorage.getItem("sheet"),
        lastEntries: lastEntries
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        loadEntry(event.data);
    });
}


async function markEntryCorrect(entry, needed, soFar) {
    let worker = new Worker(
        new URL('../sql/markEntryCorrect.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        entry: entry,
        needed: needed,
        soFar: soFar
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
    });
}


async function markEntryIncorrect(entry, needed, soFar, getTestEntry) {
    let worker = new Worker(
        new URL('../sql/markEntryIncorrect.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        entry: entry,
        needed: needed,
        soFar: soFar
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        getTestEntry();
    });
}


class TestSheetPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sheetName: sessionStorage.getItem("sheetName"),
            questionText: "",
            questionNumber: 0,
            lastEntries: [],
            processing: true,
            useSchema: false,
            solutions: null,
            needed: null,
            soFar: null,
            points: null,
            attemptAnswer: "",
            startPercentage: 0,
            endPercentage: 0,
            viewPercentage: 0,
            percentageI: 0,
            wrongAnswerBoxOpen: false
        };
        sessionStorage.setItem("results", "[]");
    }

    componentDidMount() {
        this.getTestEntry();
    }

    loadEntry = (entry) => {
        let lastEntries = this.state.lastEntries;

        for (let i = 0; i < lastEntries.length; i ++) {
            if (lastEntries[i] == entry.entry) {
                lastEntries.splice(i, 1);
                break;
            }
        }

        lastEntries.unshift(entry.entry);

        let percentage = entry.soFar / entry.needed * 100;

        this.setState({
            lastEntries: lastEntries.splice(0, 3),
            questionText: entry.question,
            processing: false,
            useSchema: entry.schema !== null,
            solutions: JSON.parse(entry.solutions),
            attemptAnswer: "",
            needed: entry.needed,
            soFar: entry.soFar,
            points: entry.points,
            startPercentage: percentage,
            viewPercentage: Math.floor(percentage * 10) / 10,
            questionNumber: this.state.questionNumber + 1,
            wrongAnswerBoxOpen: false
        });
    };

    scheduleUpdateProgressBar = () => {
        setTimeout(this.updateProgressBar, 20);
    };

    scheduleNextQuestion = () => {
        let delay = (
            this.state.startPercentage == this.state.endPercentage ? 0 : 200
        );

        setTimeout(this.getTestEntry, delay);
    }

    markEntryIncorrect = () => {
        let needed = this.state.needed + 1;
        if (needed > 10) {
            needed = 10;
        }

        let question = this.state.questionText;
        let entry = this.state.lastEntries[0];
        let getTestEntry = this.getTestEntry;

        let mark = function () {
            let results = JSON.parse(sessionStorage.getItem("results"));
            results.push({
                question: question,
                correct: false,
                completed: false,
                stars: this.state.points
            });
            sessionStorage.setItem("results", JSON.stringify(results));

            markEntryIncorrect(entry, needed, 0, getTestEntry);
        };

        this.setState({
            needed: needed,
            soFar: 0
        }, mark);
    }

    abortEarly = () => {
        if (this.state.questionNumber > 1) {
            window.location.href = "/results";
        }
        else {
            window.location.href = "/test"
        }
    }

    getTestEntry = () => {
        if (
            this.state.questionNumber < sessionStorage.getItem("noQuestions")
        ) {
            getTestEntry(this.state.lastEntries, this.loadEntry);
        }
        else {
            window.location.href = "/results";
        }
    };

    scheduleShowError = () => {
        this.setState({
            wrongAnswerBoxOpen: true
        });
    };

    updateProgressBar = () => {
        let change = this.state.endPercentage - this.state.startPercentage;
        let reverseI = 50 - this.state.percentageI;
        let viewPercentage = this.state.startPercentage + change / 2 * (
            Math.sin(Math.PI * reverseI / 50 - Math.PI / 2) + 1
        );

        let scheduleFunction;

        if (this.state.percentageI > 0) {
            scheduleFunction = this.scheduleUpdateProgressBar;
        }
        else {
            if (this.state.endPercentage == 0) {
                scheduleFunction = this.scheduleShowError;
            }
            else {
                scheduleFunction = this.scheduleNextQuestion;
            }
        }

        this.setState({
            percentageI: this.state.percentageI - 1,
            viewPercentage: Math.floor(viewPercentage * 10) / 10
        }, scheduleFunction);
    };

    onKeyDownInTextBox = (evt) => {
        if (evt.keyCode === 13 && !this.state.processing) {
            this.processAnswer();
        }
    };

    processAnswer = () => {
        this.setState({
            processing: true
        }, this.markAnswer);
    }

    markAnswer = () => {
        let soFar = this.state.soFar;
        let needed = this.state.needed;
        if (this.state.solutions.includes(this.state.attemptAnswer)) {
            let sound = new Audio(correct);
            sound.play();

            if (soFar < needed) {
                if (soFar + 1 == needed) {
                    soFar = needed = 2;
                }
                else {
                    soFar ++;
                }
            }

            let results = JSON.parse(sessionStorage.getItem("results"));
            results.push({
                question: this.state.questionText,
                correct: true,
                completed: needed == soFar,
                stars: this.state.points + (needed == soFar)
            });
            sessionStorage.setItem("results", JSON.stringify(results));

            markEntryCorrect(this.state.lastEntries[0], needed, soFar);

            this.setState({
                endPercentage: soFar / needed * 100,
                percentageI: 50
            }, this.updateProgressBar);
        }
        else {
            let sound = new Audio(incorrect);
            sound.play();

            this.setState({
                endPercentage: 0,
                percentageI: 50
            }, this.updateProgressBar);
        }
    }

    onChangeAnswer = (event) => {
        if (this.state.processing || event.target.value[0] == "\n") {
            return;
        }

        this.setState({
            attemptAnswer: event.target.value
        });
    }

    render() {
        let testBarProps = {
            noQuestion: this.state.questionNumber,
            noQuestions: sessionStorage.getItem("noQuestions"),
            backFunction: this.state.processing ? null : this.abortEarly
        };

        let textAreaProps = {
            autoFocus: true,
            autoComplete: "off",
            placeholder: "Type your answer",
            onKeyDown: ((
                !this.state.processing && this.state.attemptAnswer.length > 0
            ) ? this.onKeyDownInTextBox : null),
            value: this.state.attemptAnswer,
            onChange: this.onChangeAnswer
        };

        let checkButtonProps = {
            id: "go-button",
            className: "button" + ((
                !this.state.processing && this.state.attemptAnswer.length > 0
            ) ? "" : " button-disabled"),
            style: {
                float: "right"
            },
            onClick: ((
                !this.state.processing && this.state.attemptAnswer.length > 0
            ) ? this.processAnswer : null)
        };

        let bottomProps = {
            style: {
                margin: "auto",
                maxWidth: "600px"
            }
        };

        let barFillProps = {
            className: "bar-chart",
            style: {
                width: this.state.viewPercentage + "%"
            }
        };

        let barText = this.state.viewPercentage + "% complete";

        let wrongAnswerBox;
        if (this.state.wrongAnswerBoxOpen) {
            let wrongAnswerBoxProps = {
                question: this.state.questionText,
                answer: this.state.attemptAnswer,
                solutions: this.state.solutions,
                nextFunction: this.markEntryIncorrect,
                correctAndNextFunction: this.getTestEntry,
                entry: this.state.lastEntries[0],
                needed: this.state.needed,
                soFar: this.state.soFar
            };

            wrongAnswerBox = (
                <WrongAnswerBox {...wrongAnswerBoxProps} />
            );
        }

        let completionBar;
        if (this.state.questionNumber > 0) {
            completionBar = (
                <div className="bar-chart-container">
                    <div {...barFillProps}></div>
                    <div className="bar-chart-figure">
                        {barText}
                    </div>
                </div>
            );
        }

        let stars = [];
        let noStars = this.state.points + (
            this.state.needed == 2 && this.state.soFar == 2
        );
        for (let i = 0; i < noStars; i++) {
            let starProps = {
                key: i,
                src: starImage
            };

            stars.push(
                <img {...starProps}></img>
            );
        }

        return (
            <div>
                <TestBar {...testBarProps} />
                <div className="main" tabIndex="-1">
                    <div className="test-area">
                        <div>
                            <h1>{this.state.sheetName}</h1>
                            <div style={{height: "23px"}}>
                                {stars}
                            </div>
                            <p className="question-text">
                                {this.state.questionText}
                            </p>
                            <div className="answer-area">
                                <div className="textarea-container">
                                    <textarea {...textAreaProps}></textarea>
                                </div>
                                <div {...bottomProps}>
                                    <button {...checkButtonProps}>
                                        Check
                                    </button>
                                    {completionBar}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {wrongAnswerBox}
                <Footer />
            </div>
        );
    }
}

export default TestSheetPage;
