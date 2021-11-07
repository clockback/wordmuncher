import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import closeImage from '../../images/close.svg';
import {addMessageListener} from '../sql/messageListener.js';
import Search from './search.js';
import SelectTable from './selectTable.js';


let checkNameWorker;


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

async function saveNewSheet(name, backFunction) {
    let translator = JSON.parse(localStorage.getItem("translators"))[0];
    let worker = new Worker(
        new URL('../sql/saveNewSheet.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        translator: translator.translator,
        name: name
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        backFunction();
    });
}

class CreateSheet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nameModified: false,
            sheetName: "",
            permitted: false,
            processing: false,
            alreadyExists: false
        };
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
        this.setState({processing: true});
        saveNewSheet(this.state.sheetName, this.onClickBack);
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
            onKeyDown: this.onClickBack
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
            values: [],
            selection: "multiple",
            more: false
        }

        let backButtonProps = {
            className: "button" + (
                this.state.permitted ? "" : " button-disabled"
            ),
            onClick: (
                this.state.permitted && !this.state.processing
            ) ? this.onClickSave : null
        };

        let saveButtonProps = {
            className: "button",
            onClick: this.state.processing ? null : this.onClickBack
        };

        return (
            <div {...dialogueProps}>
                <div className="container">
                    <div className="title-bar">
                        <div {...closeButtonDivProps}>
                            <img {...closeButtonProps}></img>
                        </div>
                    </div>
                    <div className="container-contents" tabIndex="-1">
                        <h1>Add new sheet</h1>
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
                            <SelectTable {...selectTableProps} />
                        </div>
                        <p>
                            <button {...backButtonProps}>Save</button>
                            <button {...saveButtonProps}>Back</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateSheet;
