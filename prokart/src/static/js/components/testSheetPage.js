import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import TestBar from './testBar.js';
import {addMessageListener} from '../sql/messageListener.js';
import Footer from './footer.js';
import correct from '../../audio/correct.mp3';
import incorrect from '../../audio/incorrect.mp3';


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


async function markEntryIncorrect(entry, needed, soFar) {
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
    });
}


class TestSheetPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sheetName: sessionStorage.getItem("sheetName"),
            questionText: "",
            questionNumber: 1,
            lastEntries: [],
            processing: true,
            useSchema: false,
            solutions: null,
            needed: null,
            soFar: null,
            attemptAnswer: "",
            startPercentage: 0,
            endPercentage: 0,
            viewPercentage: 0,
            percentageI: 0
        };
    }

    componentDidMount() {
        getTestEntry(this.state.lastEntries, this.loadEntry);
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
            startPercentage: percentage,
            viewPercentage: Math.floor(percentage * 10) / 10
        });
    };

    updateProgressBar = () => {
        let start = this.state.startPercentage;
        let end = this.state.endPercentage;
        let change = end - start;
        let reverseI = 50 - this.state.percentageI;
        let viewPercentage = start + change / 2 * (
            Math.sin(Math.PI * reverseI / 50 - Math.PI / 2) + 1
        );

        if (this.state.percentageI > 0) {
            setTimeout(this.updateProgressBar, 20);
        }

        this.setState({
            percentageI: this.state.percentageI - 1,
            viewPercentage: Math.floor(viewPercentage * 10) / 10
        });
    };

    onKeyDownInTextBox = (evt) => {
        if (evt.keyCode === 13) {
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

            if (soFar < needed ) {
                if (soFar + 1 == needed) {
                    soFar = needed = 2;
                }
                else {
                    soFar ++;
                }

                this.setState({
                    endPercentage: soFar / needed * 100,
                    percentageI: 50
                }, this.updateProgressBar);

                markEntryCorrect(this.state.lastEntries[0], needed, soFar);
            }
        }
        else {
            let sound = new Audio(incorrect);
            sound.play();

            needed ++;
            if (needed > 10) {
                needed = 10;
            }

            soFar = 0;

            this.setState({
                endPercentage: soFar / needed * 100,
                percentageI: 50
            }, this.updateProgressBar);

            markEntryIncorrect(this.state.lastEntries[0], needed, soFar);
        }
    }

    onChangeAnswer = (event) => {
        this.setState({
            attemptAnswer: event.target.value
        });
    }

    render() {
        return (
            <div>
                <TestBar noQuestions={sessionStorage.getItem("noQuestions")} />
                <div className="main" tabIndex="-1">
                    <div className="test-area">
                        <div>
                            <h1>{this.state.sheetName}</h1>
                            <div style={{height: "23px"}}></div>
                            <p className="question-text">
                                {this.state.questionText}
                            </p>
                            <div className="answer-area">
                                <div className="textarea-container">
                                    <textarea autoFocus autoComplete="off" placeholder="Type your answer" disabled={this.state.processing} onKeyDown={this.onKeyDownInTextBox} value={this.state.attemptAnswer} onChange={this.onChangeAnswer}></textarea>
                                </div>
                                <div style={{margin: "auto", maxWidth: "600px"}}>
                                    <button id="go-button" className={"button" + ((!this.state.processing && this.state.attemptAnswer.length > 0) ? "" : " button-disabled")} style={{float: "right"}} onClick={!this.state.processing && this.state.attemptAnswer.length > 0 ? this.processAnswer : null}>
                                        Check
                                    </button>
                                    <div className="bar-chart-container">
                                        <div className="bar-chart" style={{width: `${this.state.viewPercentage}%`}}></div>
                                        <div className="bar-chart-figure">{`${this.state.viewPercentage}% complete`}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

export default TestSheetPage;
