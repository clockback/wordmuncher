import React, {Component} from 'react';
import {isMobile} from "react-device-detect";
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

import Footer from './footer.js';
import Search from './search.js';
import SelectTable from './selectTable.js';
import CreateSheet from './createSheet.js';
import editImage from '../../images/edit.svg';
import {addMessageListener} from '../sql/messageListener.js';


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


class CreatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addNewSheetOpen: false,
            sheets: [],
            moreSheets: false,
            sheetSelected: null,
            entries: [],
            moreEntries: false,
            entrySelected: null
        };
    }

    componentDidMount() {
        getSheets(this.loadSheets);
    }

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

    searchSheetsAndEntries = (query) => {
        this.setState({
            sheets: [],
            moreSheets: false,
            sheetSelected: null,
            entries: [],
            moreEntries: false,
            entrySelected: null
        }, function () {
            getSheets(this.loadSheets, query);
        });
    };

    onClickBack = () => {
        window.location.href = "/";
    };

    onClickAddNewSheet = () => {
        this.setState({addNewSheetOpen: true});
    };

    onClickBackMisc = () => {
        this.setState({
            addNewSheetOpen: false
        });
    };

    onSelectSheet = (response) => {
        this.setState({
            sheetSelected: response.idValues
        });
    };

    onSelectEntry = (response) => {
        this.setState({
            entrySelected: response.selection !== null
        });
    };

    render() {
        let sheetTableContainerProps = {
            id: "sheet-table-container",
            tabIndex: "-1",
            style: {
                overflowX: "auto",
                overflowY: "hidden",
                outline: "none"
            }
        };

        let entryTableContainerProps = {
            id: "entry-table-container",
            tabIndex: "-1",
            style: {
                overflowX: "auto",
                overflowY: "hidden",
                outline: "none"
            }
        };

        let sheetsTableProps = {
            id: "sheets-table",
            columns: ["Sheet", "% Complete", "# Entries"],
            values: this.state.sheets,
            selection: "single",
            selectionCallback: this.onSelectSheet,
            more: this.state.moreSheets
        };

        let entriesTableProps = {
            id: "entries-table",
            columns: ["Question", "Answer", "# Mentions", "Stars"],
            values: [],
            selection: "single",
            more: this.state.moreEntries
        };

        let addNewSheet = null;
        if (this.state.addNewSheetOpen) {
            addNewSheet = <CreateSheet closeCallable={this.onClickBackMisc} />
        }

        return (
            <div>
                <div className="main">
                    <div style={{marginLeft: "5px"}}>
                        <div>
                            <h1>Create</h1>
                            <Search name="sheet query" onChange={this.searchSheetsAndEntries} />
                        </div>
                        <div className={isMobile ? null : "column"}>
                            <h2>Sheets</h2>
                            <div {...sheetTableContainerProps}>
                                <SelectTable {...sheetsTableProps} />
                            </div>
                            <div>
                                <button id="new-sheet" className="button" onClick={this.onClickAddNewSheet}>+</button>
                                <button id="edit-sheet" className={"button" + (this.state.sheetSelected === null ? " button-disabled" : "")}>
                                    <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                                </button>
                                <button id="delete-sheet" className={"button" + (this.state.sheetSelected === null ? " button-disabled" : "")}>-</button>
                            </div>
                        </div>
                        <div className={isMobile ? null : "column"}>
                            <h2>Entry</h2>
                            <div {...entryTableContainerProps}>
                                <SelectTable {...entriesTableProps} />
                            </div>
                            <div>
                                <button id="new-entry" className="button">+</button>
                                <button id="edit-entry" className={"button" + (this.state.entrySelected ? "" : " button-disabled")}>
                                    <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                                </button>
                                <button id="delete-entry" className={"button" + (this.state.entrySelected ? "" : " button-disabled")}>-</button>
                            </div>
                        </div>
                        <div style={{clear: "both"}}>
                            <p>
                                <button id="back" className="button" onClick={this.onClickBack}>
                                    Back
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
                <Footer />
                {addNewSheet}
            </div>
        );
    }
}

export default CreatePage;
