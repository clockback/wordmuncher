import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import closeImage from '../../images/close.svg';
import {addMessageListener} from '../sql/messageListener.js';
import Search from './search.js';
import SelectTable from './selectTable.js';


let checkNameWorker = null;
let getEntriesWorker = null;


async function checkSheetName(name, permitSheetName) {
    if (checkNameWorker) {
        checkNameWorker.terminate();
    }

    let translator = JSON.parse(localStorage.getItem("translators"))[0];

    checkNameWorker = new Worker(
        new URL('../sql/checkSheetName.js', import.meta.url)
    );
    initBackend(checkNameWorker);
    checkNameWorker.postMessage({
        translator: translator.translator,
        name: name
    });

    addMessageListener(checkNameWorker, function (event) {
        checkNameWorker.terminate();
        permitSheetName(event.data);
    });
}


async function getEntries(loadEntries, query = null) {
    if (getEntriesWorker) {
        getEntriesWorker.terminate();
    }

    let translator = JSON.parse(localStorage.getItem("translators"))[0];

    getEntriesWorker = new Worker(
        new URL('../sql/getEntries.js', import.meta.url)
    );
    initBackend(getEntriesWorker);
    getEntriesWorker.postMessage({
        translator: translator.translator,
        searchQueries: query ? query.split(' ') : []
    });

    addMessageListener(getEntriesWorker, function (event) {
        getEntriesWorker.terminate();
        loadEntries(event.data);
    });
}


async function getSheetMentions(sheet, loadMentions) {
    let worker = new Worker(
        new URL('../sql/getSheetMentions.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        sheet: sheet
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        loadMentions(event.data);
    });
}


async function saveNewSheet(name, entries, backFunction) {
    let translator = JSON.parse(localStorage.getItem("translators"))[0];
    let worker = new Worker(
        new URL('../sql/saveNewSheet.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        translator: translator.translator,
        name: name,
        entries: entries
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        backFunction(true);
    });
}


async function saveExistingSheet(sheet, name, entries, backFunction) {
    let worker = new Worker(
        new URL('../sql/saveExistingSheet.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        sheet: sheet,
        name: name,
        entries: entries
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        backFunction(true);
    });
}


class CreateSheet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nameModified: false,
            sheetName: this.props.edit ? this.props.existingSheet[0] : "",
            permitted: this.props.edit,
            processing: false,
            alreadyExists: false,
            entries: [],
            selectedEntries: [],
            moreEntries: false,
            loadedEntries: false,
            loadedMentions: false
        };
    };

    componentDidMount() {
        getEntries(this.loadEntries);
        if (this.props.edit) {
            getSheetMentions(this.props.existingSheet.id, this.loadMentions);
        }
    }

    loadMentions = (entries) => {
        this.setState({
            selectedEntries: entries,
            loadedMentions: true
        });
    };

    loadEntries = (entries) => {
        let updatedEntries = this.state.entries;
        for (let i = 0; i < entries.length && i < 5; i ++) {
            updatedEntries.push({
                0: entries[i].question,
                1: entries[i].answer,
                2: entries[i].mentions,
                3: entries[i].stars,
                id: entries[i].entry
            });
        }
        this.setState({
            entries: updatedEntries,
            moreEntries: entries.length == 6,
            loadedEntries: true
        });
    };

    selectEntry = (data) => {
        this.setState({
            selectedEntries: data.idValues
        });
    };

    onChangeSheetName = (evt) => {
        this.setState({
            sheetName: evt.target.value,
            permitted: false,
            nameModified: true
        });

        if (evt.target.value.length > 0 && evt.target.value.length <= 80) {
            checkSheetName(evt.target.value, this.permitSheetName);
        }
    };

    permitSheetName = (permitted) => {
        this.setState({permitted: permitted, alreadyExists: !permitted});
    };

    onClickSave = (evt) => {
        this.setState({processing: true}, function () {
            if (this.props.edit) {
                saveExistingSheet(
                    this.props.existingSheet.id, this.state.sheetName,
                    this.state.selectedEntries, this.props.closeCallable
                );
            }
            else {
                saveNewSheet(
                    this.state.sheetName, this.state.selectedEntries,
                    this.props. closeCallable
                );
            }
        });
    };

    onKeyDown = (evt) => {
        if (evt.keyCode === 27) {
            this.onClickBack();
        }
    };

    onClickBack = () => {
        this.props.closeCallable();
    };

    render() {
        let nameWarning = null;
        let loadedEntriesTable = (
            this.state.loadedEntries
            && this.state.loadedMentions == this.props.edit
        );

        if (this.state.nameModified && this.state.sheetName.length == 0) {
            nameWarning = (
                <span style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Must provide the sheet a name.
                </span>
            );
        }

        else if (this.state.nameModified && this.state.sheetName.length > 80) {
            nameWarning = (
                <span style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Sheet name must be no more than 80 characters.
                </span>
            );
        }

        else if (this.state.alreadyExists) {
            nameWarning = (
                <span style={{color: "rgb(100, 0, 0)", fontWeight: "bold"}}>
                    Sheet already exists.
                </span>
            );
        }

        let dialogueProps = {
            id: "add-sheet-container-background",
            className: "container-background container-background-transparent",
            onKeyDown: this.onKeyDown
        };

        let closeButtonDivProps = {
            style: {
                float: "right",
                marginRight: "10px",
                marginTop: "5px"
            },
            onClick: this.state.processing ? null : this.onClickBack
        };

        let closeButtonProps = {
            src: closeImage,
            style: {
                height: "20px",
                width: "20px",
                cursor: "pointer"
            }
        };

        let sheetNameProps = {
            id: "new-sheet-name",
            autoComplete: "off",
            value: this.state.sheetName,
            onChange: this.onChangeSheetName,
            disabled: this.state.processing ? "disabled" : ""
        };

        let selectTableDivProps = {
             style: {
                overflowX: "auto",
                overflowY: "hidden"
             },
             tabIndex: "-1"
        };

        let selectTableProps = {
            columns: ["Question", "Answer", "# Mentions", "Stars"],
            values: this.state.entries,
            selection: "multiple",
            more: false,
            selectionCallback: this.selectEntry,
            selectedIds: this.state.selectedEntries
        }

        let saveButtonProps = {
            className: "button" + (
                this.state.permitted ? "" : " button-disabled"
            ),
            onClick: (
                this.state.permitted && !this.state.processing
                && loadedEntriesTable
            ) ? this.onClickSave : null
        };

        let backButtonProps = {
            className: "button",
            onClick: this.state.processing ? null : this.onClickBack
        };

        let title = this.props.edit ? "Edit sheet" : "Add new sheet";

        let entriesTable;
        if (loadedEntriesTable) {
            entriesTable = (
                <SelectTable {...selectTableProps} />
            );
        }

        return (
            <div {...dialogueProps}>
                <div className="container">
                    <div className="title-bar">
                        <div {...closeButtonDivProps}>
                            <img {...closeButtonProps}></img>
                        </div>
                    </div>
                    <div className="container-contents" tabIndex="-1">
                        <h1>{title}</h1>
                        <p>Sheet name:</p>
                        <div>
                            <div className="input-box">
                                <input {...sheetNameProps} autoFocus></input>
                            </div>
                            {nameWarning}
                        </div>
                        <p>Search entries:</p>
                        <Search />
                        <div {...selectTableDivProps}>
                            {entriesTable}
                        </div>
                        <p>
                            <button {...saveButtonProps}>Save</button>
                            <button {...backButtonProps}>Back</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateSheet;
