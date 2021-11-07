import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import closeImage from '../../images/close.svg';
import editImage from '../../images/edit.svg';
import {addMessageListener} from '../sql/messageListener.js';
import DropDown from './dropDown.js';
import Search from './search.js';
import SelectTable from './selectTable.js';
import MoreAnswers from './moreAnswers.js';


let getSchemasWorker = null;
let checkQuestionWorker = null;
let getSheetsWorker = null;


async function getSheets(loadSheets, query = null) {
    if (getSheetsWorker) {
        getSheetsWorker.terminate();
    }

    let translator = JSON.parse(localStorage.getItem("translators"))[0];

    getSheetsWorker = new Worker(
        new URL('../sql/getSheets.js', import.meta.url)
    );
    initBackend(getSheetsWorker);
    getSheetsWorker.postMessage({
        translator: translator.translator,
        searchQueries: query ? query.split(' ') : []
    });

    addMessageListener(getSheetsWorker, function (event) {
        getSheetsWorker.terminate();
        loadSheets(event.data)
    });
}


async function checkQuestionText(question, permitQuestion) {
    if (checkQuestionWorker) {
        checkQuestionWorker.terminate();
    }

    let translator = JSON.parse(localStorage.getItem("translators"))[0];

    checkQuestionWorker = new Worker(
        new URL('../sql/checkQuestion.js', import.meta.url)
    );
    initBackend(checkQuestionWorker);
    checkQuestionWorker.postMessage({
        translator: translator.translator,
        question: question
    });

    addMessageListener(checkQuestionWorker, function (event) {
        checkQuestionWorker.terminate();
        permitQuestion(event.data);
    });
}


async function getSchemas(loadSchemas) {
    if (getSchemasWorker) {
        getSchemasWorker.terminate();
    }

    let translator = JSON.parse(localStorage.getItem("translators"))[0];

    getSchemasWorker = new Worker(
        new URL('../sql/getSchemas.js', import.meta.url)
    );
    initBackend(getSchemasWorker);
    getSchemasWorker.postMessage({
        translator: translator.translator,
    });

    addMessageListener(getSchemasWorker, function (event) {
        getSchemasWorker.terminate();
        loadSchemas(event.data);
    });
}


async function saveNewEntry(question, solutions, finishSaving) {
    let translator = JSON.parse(localStorage.getItem("translators"))[0];

    let worker = new Worker(
        new URL('../sql/saveNewEntry.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        translator: translator.translator,
        schema: null,
        question: question,
        solutions: solutions
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        finishSaving();
    });
}


class CreateEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            processing: false,
            questionModified: false,
            permittedQuestion: false,
            questionAlreadyExists: false,
            question: "",
            schemas: [],
            answerTextModified: false,
            answerText: "",
            sheets: [],
            selectedSheets: [],
            moreSheets: false,
            solutions: []
        };
    };

    componentDidMount() {
        getSchemas(this.loadSchemas);
        getSheets(this.loadSheets);
    }

    loadSchemas = (schemas) => {
        this.state.schemas = schemas;
    };

    loadSheets = (sheets) => {
        let updatedSheets = this.state.sheets;
        for (let i = 0; i < sheets.length && i < 5; i ++) {
            updatedSheets.push({
                0: sheets[i].name,
                1: sheets[i].score,
                2: sheets[i].noEntries,
                id: sheets[i].sheet
            });
        }
        this.setState({
            sheets: updatedSheets,
            moreSheets: sheets.length == 6
        });
    };

    onKeyDown = (evt) => {
        if (evt.keyCode === 27) {
            this.onClickBack();
        }
    };

    selectSchema = (results) => {
        console.log(results);
    };

    changeQuestion = (event) => {
        this.setState({
            question: event.target.value,
            permittedQuestion: false,
            questionModified: true
        }, this.checkQuestion);
    };

    checkQuestion = () => {
        if (
            this.state.question.length > 0 && this.state.question.length <= 80
        ) {
            checkQuestionText(this.state.question, this.permitQuestion);
        }
    };

    permitQuestion = (permitted) => {
        this.setState({
            permittedQuestion: permitted, questionAlreadyExists: !permitted
        });
    };

    changeAnswerText = (event) => {
        this.setState({
            answerText: event.target.value,
            answerTextModified: true
        });
    };

    saveEntry = () => {
        this.setState({processing: true}, function () {
            let solutions = this.state.solutions;
            solutions.unshift(this.state.answerText);
            saveNewEntry(this.state.question, solutions, this.onClickBack);
        });
    };

    onClickBack = () => {
        this.props.closeCallable();
    };

    selectSheet = (data) => {
        this.setState({
            selectedSheets: data.idValues
        });
    };

    promoteAnswer = (newAnswer) => {
        this.setState({
            answerText: newAnswer
        });
    };

    checkEliminations = (evt) => {
        for (let i = 0; i < this.state.solutions.length; i ++) {
            if (this.state.solutions[i] == this.state.answerText) {
                let updatedSolutions = this.state.solutions;
                updatedSolutions.splice(i, 1);

                this.setState({
                    solutions: updatedSolutions
                });

                break;
            }
        }
    };

    updateSolutions = (solutions) => {
        this.setState({
            solutions: solutions
        });
    };

    searchSheets = (query) => {
        this.setState({
            sheets: [],
            moreSheets: false,
            sheetSelected: null
        }, function () {
            getSheets(this.loadSheets, query);
        });
    };

    render() {
        let questionWarning = null;
        let answerWarning = null;

        if (this.state.questionModified && this.state.question.length == 0) {
            questionWarning = (
                <span id="message-new-entry-empty-question" style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Must provide the entry a question.
                </span>
            );
        }

        else if (this.state.question.length > 80) {
            questionWarning = (
                <span id="message-new-entry-long-question" style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Question must be no more than 80 characters.
                </span>
            );
        }

        else if (this.state.questionAlreadyExists) {
            questionWarning = (
                <span id="message-new-entry-already-exists" style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Question already exists.
                </span>
            );
        }

        if (
            this.state.answerTextModified && this.state.answerText.length == 0
        ) {
            answerWarning = (
                <span id="message-new-entry-empty-answer" style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Must provide the entry an answer.
                </span>
            );
        }

        else if (this.state.answerText.length > 80) {
            answerWarning = (
                <span id="message-new-entry-long-answer" style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Answer must be no more than 80 characters.
                </span>
            );
        }

        let schemaOptions = [
            <option key={0}>No schema:</option>
        ];

        for (let i = 0; i < this.state.schemas.length; i ++) {
            schemaOptions.push(
                <option key={i + 1}>{this.state.schemas[i].name}</option>
            );
        }

        let canSave = (
            this.state.permittedQuestion && this.state.answerText.length > 0
            && this.state.answerText.length <= 80
        );

        return (
            <div id="new-entry-container-background" className="container-background container-background-transparent" onKeyDown={this.onKeyDown}>
                <div className="container">
                    <div className="title-bar">
                        <div style={{float: "right", marginRight: "10px", marginTop: "5px"}} onClick={this.state.processing ? null : this.props.closeCallable}>
                            <img src={closeImage} style={{height: "20px", width: "20px", cursor: "pointer"}}></img>
                        </div>
                    </div>
                    <div className="container-contents" tabIndex="-1">
                        <h1>Add new entry</h1>
                        <p>Question:</p>
                        <div id="new-entry-question-div">
                            <div className="input-box">
                                <input id="new-entry-question" autoComplete="off" tabIndex="0" value={this.state.question} onChange={this.changeQuestion} autoFocus></input>
                            </div>
                            {questionWarning}
                        </div>
                        <div style={{display: "inline-block", width: "300px", margin: "10px 0"}}>
                            <DropDown preserve={true} callable={this.selectSchema}>{schemaOptions}</DropDown>
                        </div>
                        <button id="new-entry-new-schema" className="button" style={{marginTop: "20px"}} tabIndex="0">+</button>
                        <button id="new-entry-edit-schema" className="button button-disabled" style={{marginTop: "20px"}} tabIndex="0">
                            <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                        </button>
                        <p>Answer:</p>
                        <div>
                            <div className="input-box">
                                <input id="new-entry-answer" autoComplete="off" tabIndex="0" value={this.state.answerText} onChange={this.changeAnswerText} onBlur={this.checkEliminations}></input>
                            </div>
                            {answerWarning}
                        </div>
                        <p>More answers:</p>
                        <MoreAnswers promoteAnswer={this.promoteAnswer} mainAnswer={this.state.answerText} updateSolutions={this.updateSolutions} solutions={this.state.solutions} />
                        <p>Search sheets:</p>
                        <Search onChange={this.searchSheets} />
                        <div style={{overflowX: "auto", overflowY: "hidden"}} tabIndex="-1">
                            <SelectTable columns={["Sheet", "% Complete", "# Entries"]} values={this.state.sheets} selection="multiple" selectionCallback={this.selectSheet} />
                        </div>
                        <p>
                            <button id="save-new-entry" className={"button" + (canSave ? "" : " button-disabled")} tabIndex="0" onClick={canSave && !this.state.processing ? this.saveEntry : null}>Save</button>
                            <button id="back-new-entry" className="button" tabIndex="0" onClick={this.state.processing ? null : this.props.closeCallable}>Back</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateEntry;
