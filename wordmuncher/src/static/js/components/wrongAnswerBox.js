import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import closeImage from '../../images/close.svg';
import {addMessageListener} from '../sql/messageListener.js';


var difflib = require('difflib');


async function addAnswer(entry, answer, nextEntry) {
    let worker = new Worker(
        new URL('../sql/addAnswer.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        entry: entry,
        answer: answer
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        nextEntry();
    });
}


async function removeAnswer(entry, answer, finishProcessing) {
    let worker = new Worker(
        new URL('../sql/removeAnswer.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        entry: entry,
        answer: answer
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        finishProcessing();
    });
}


class WrongAnswerBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            mainSolution: "",
            nextSolutions: [],
            processing: false
        };
    }

    componentDidMount() {
        let mainSolution = this.findClosestSolution();
        let nextSolutions = this.props.solutions;

        if (nextSolutions.length > 0) {
            nextSolutions.splice(nextSolutions.indexOf(mainSolution), 1);
        }

        this.setState({
            mainSolution: mainSolution,
            nextSolutions: nextSolutions
        });
    }

    nextEntry = () => {
        this.setState({
            processing: true
        }, this.props.nextFunction);
    }

    addAnswer = () => {
        this.setState({processing: true}, function () {
            addAnswer(
                this.props.entry, this.props.answer,
                this.props.correctAndNextFunction
            );
        });
    };

    findClosestSolution = () => {
        let close = difflib.getCloseMatches(
            this.props.answer, this.props.solutions
        );

        if (close.length > 0) {
            return close[0];
        }
        else {
            return this.props.solutions[0];
        }
    };

    cleanTable = (answer) => {
        let solutions = this.state.nextSolutions;
        solutions.splice(solutions.indexOf(answer), 1);
        this.setState({
            solutions: solutions
        });
    };

    startProcessing = (func) => {
        this.setState({
            processing: true
        }, func());
    }

    finishProcessing = () => {
        this.setState({
            processing: false
        });
    };

    decorateTrashFunction = (solution) => {
        let entry = this.props.entry;
        let cleanTable = this.cleanTable;
        let startProcessing = this.startProcessing;
        let finishProcessing = this.finishProcessing;

        let trashFunction = function () {
            startProcessing(function () {
                removeAnswer(entry, solution, finishProcessing);
                cleanTable(solution);
            });
        };

        return trashFunction;
    };

    render() {
        let mainDivProps = {
            className: "container-background container-background-transparent"
        };

        let closeButtonDivProps = {
            style: {
                float: "right",
                marginRight: "10px",
                marginTop: "5px"
            },
            onClick: this.state.processing ? null : this.nextEntry
        };

        let closeButtonProps = {
             src: closeImage,
             style: {
                height: "20px",
                width: "20px",
                cursor: "pointer"
            }
        };

        let failedQuestionProps = {
            style: {
                fontSize: "27px",
                fontWeight: "bold"
            }
        };

        let nextButtonProps = {
            id: "next-button",
            className: "button",
            tabIndex: "0",
            autoFocus: true,
            onClick: this.state.processing ? null : this.nextEntry
        };

        let addButtonProps = {
            id: "add-to-answers-button",
            className: "button",
            tabIndex: "0",
            onClick: this.state.processing ? null : this.addAnswer
        };

        let otherAnswers;
        if (this.state.nextSolutions.length > 0) {
            let rows = [];
            for (let i = 0; i < this.state.nextSolutions.length; i ++) {
                let trashFunction = this.decorateTrashFunction(
                    this.state.nextSolutions[i]
                );
                let trashProps = {
                    className: "trash-can",
                    onClick: this.processing ? null : trashFunction
                };
                rows.push(
                    <tr key={i}>
                        <td>{this.state.nextSolutions[i]}</td>
                        <td {...trashProps}>️🗑️</td>
                    </tr>
                );
            }

            otherAnswers = (
                <div>
                    <p>Other answers:</p>
                    <div>
                        <table id="answers-table" className="table">
                            <tbody className="main-rows main-rows-alt">
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <div {...mainDivProps}>
                <div className="container">
                    <div className="title-bar">
                        <div {...closeButtonDivProps}>
                            <img {...closeButtonProps}></img>
                        </div>
                    </div>
                    <div className="container-contents" tabIndex="-1">
                        <p>Question:</p>
                        <div {...failedQuestionProps}>
                            {this.props.question}
                        </div>
                        <p>Your answer:</p>
                        <div className="wrong-answer">
                            {this.props.answer}
                        </div>
                        <p>Correct answer:</p>
                        <div className="right-answer">
                            {this.state.mainSolution}
                        </div>
                        <div>
                            <button {...nextButtonProps}>Next</button>
                            <button {...addButtonProps}>Add to answers</button>
                        </div>
                        {otherAnswers}
                    </div>
                </div>
            </div>
        );
    }
}

export default WrongAnswerBox;
