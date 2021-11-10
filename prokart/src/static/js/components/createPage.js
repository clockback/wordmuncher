import React, {Component} from 'react';
import {isMobile} from "react-device-detect";
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import Footer from './footer.js';
import Search from './search.js';
import SelectTable from './selectTable.js';
import CreateSheet from './createSheet.js';
import CreateEntry from './createEntry.js';
import editImage from '../../images/edit.svg';
import {addMessageListener} from '../sql/messageListener.js';


let getSheetsWorker = null;
let getEntriesWorker = null;


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


async function deleteSheet(sheet, entries, updateMentions) {
    let entriesIds = [];
    for (let i = 0; i < entries.length; i ++) {
        entriesIds.push(entries[i].id);
    }

    let worker = new Worker(
        new URL('../sql/deleteSheet.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        sheet: sheet,
        entries: entriesIds
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        updateMentions(event.data);
    });
}


async function deleteEntry(entry, sheets, updateMentions) {
    let sheetsIds = [];
    for (let i = 0; i < sheets.length; i ++) {
        sheetsIds.push(sheets[i].id);
    }

    let worker = new Worker(
        new URL('../sql/deleteEntry.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        entry: entry,
        sheets: sheetsIds
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        updateMentions(event.data);
    });
}


class CreatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addNewSheetOpen: false,
            addNewEntryOpen: false,
            editSheetOpen: false,
            editEntryOpen: false,
            sheets: [],
            moreSheets: false,
            sheetSelected: null,
            entries: [],
            moreEntries: false,
            entrySelected: null,
            lastSearch: ""
        };
    }

    componentDidMount() {
        getSheets(this.loadSheets);
        getEntries(this.loadEntries);
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
            moreEntries: entries.length == 6
        });
    };

    searchSheetsAndEntries = (query) => {
        this.setState({
            sheets: [],
            moreSheets: false,
            entries: [],
            moreEntries: false,
            lastSearch: query
        }, function () {
            getSheets(this.loadSheets, query);
            getEntries(this.loadEntries, query);
        });
    };

    onClickBack = () => {
        window.location.href = "/";
    };

    onClickAddNewSheet = () => {
        this.setState({addNewSheetOpen: true});
    };

    onClickAddNewEntry = () => {
        this.setState({addNewEntryOpen: true});
    };

    onClickEditSheet = () => {
        this.setState({editSheetOpen: true});
    };

    onClickEditEntry = () => {
        this.setState({editEntryOpen: true});
    };

    onClickBackMisc = (refresh) => {
        let updatedState = {
            addNewSheetOpen: false,
            addNewEntryOpen: false,
            editSheetOpen: false,
            editEntryOpen: false
        };

        if (refresh) {
            updatedState = Object.assign(updatedState, {
                sheets: [],
                moreSheets: false,
                entries: [],
                moreEntries: false
            });
        }

        this.setState(updatedState, function () {
            if (refresh) {
                getSheets(this.loadSheets, this.state.lastSearch);
                getEntries(this.loadEntries, this.state.lastSearch);
            }
        });
    };

    onSelectSheet = (response) => {
        this.setState({
            sheetSelected: response.idValues
        });
    };

    onSelectEntry = (response) => {
        this.setState({
            entrySelected: response.idValues
        });
    };

    updateEntriesMentions = (affectedEntries) => {
        let updatedEntries = [...this.state.entries];

        for (let i = 0; i < updatedEntries.length; i ++) {
            if (affectedEntries.includes(updatedEntries[i].id)) {
                updatedEntries[i][2] -= 1;
            }
        }

        this.setState({
            entries: updatedEntries
        });
    };

    onDeleteSheet = () => {
        deleteSheet(
            this.state.sheetSelected, this.state.entries,
            this.updateEntriesMentions
        );

        let sheets = [...this.state.sheets];

        for (let i = 0; i < sheets.length; i ++) {
            if (sheets[i].id == this.state.sheetSelected) {
                sheets.splice(i, 1);
                break;
            }
        }

        this.setState({
            sheetSelected: null,
            sheets: sheets
        })
    };

    updateSheetsMentions = (affectedSheets) => {
        let updatedSheets = [...this.state.sheets];

        for (let i = 0; i < updatedSheets.length; i ++) {
            if (affectedSheets.includes(updatedSheets[i].id)) {
                updatedSheets[i][2] -= 1;
            }
        }

        this.setState({
            sheets: updatedSheets
        });
    };

    onDeleteEntry = () => {
        deleteEntry(
            this.state.entrySelected, this.state.sheets,
            this.updateSheetsMentions
        );

        let entries = [...this.state.entries];

        for (let i = 0; i < entries.length; i ++) {
            if (entries[i].id == this.state.entrySelected) {
                entries.splice(i, 1);
                break;
            }
        }

        this.setState({
            entrySelected: null,
            entries: entries
        })
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
            more: this.state.moreSheets,
            selectedIds: this.state.sheetSelected
        };

        let entriesTableProps = {
            id: "entries-table",
            columns: ["Question", "Answer", "# Mentions", "Stars"],
            values: this.state.entries,
            selection: "single",
            selectionCallback: this.onSelectEntry,
            more: this.state.moreEntries,
            selectedIds: this.state.entrySelected
        };

        let dialogue = null;

        if (this.state.addNewSheetOpen) {
            let createSheetProps = {
                closeCallable: this.onClickBackMisc,
                edit: false
            };
            dialogue = <CreateSheet {...createSheetProps} />
        }

        else if (this.state.addNewEntryOpen) {
            let createEntryProps = {
                closeCallable: this.onClickBackMisc,
                edit: false
            };
            dialogue = <CreateEntry {...createEntryProps} />
        }

        else if (this.state.editSheetOpen) {
            let existingSheet;

            for (let i = 0; i < this.state.sheets.length; i ++) {
                if (this.state.sheets[i].id == this.state.sheetSelected) {
                    existingSheet = this.state.sheets[i];
                    break;
                }
            }

            let createSheetProps = {
                closeCallable: this.onClickBackMisc,
                edit: true,
                existingSheet: existingSheet
            };
            dialogue = <CreateSheet {...createSheetProps} />
        }

        else if (this.state.editEntryOpen) {
            let existingEntry;

            for (let i = 0; i < this.state.entries.length; i ++) {
                if (this.state.entries[i].id == this.state.entrySelected) {
                    existingEntry = this.state.entries[i];
                    break;
                }
            }

            let createEntryProps = {
                closeCallable: this.onClickBackMisc,
                edit: true,
                existingEntry: existingEntry
            };
            dialogue = <CreateEntry {...createEntryProps} />
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
                                <button id="edit-sheet" className={"button" + (this.state.sheetSelected === null ? " button-disabled" : "")} onClick={this.state.sheetSelected === null ? null : this.onClickEditSheet}>
                                    <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                                </button>
                                <button id="delete-sheet" className={"button" + (this.state.sheetSelected === null ? " button-disabled" : "")} onClick={this.state.sheetSelected === null ? null : this.onDeleteSheet}>-</button>
                            </div>
                        </div>
                        <div className={isMobile ? null : "column"}>
                            <h2>Entry</h2>
                            <div {...entryTableContainerProps}>
                                <SelectTable {...entriesTableProps} />
                            </div>
                            <div>
                                <button id="new-entry" className="button" onClick={this.onClickAddNewEntry}>+</button>
                                <button id="edit-entry" className={"button" + (this.state.entrySelected ? "" : " button-disabled")} onClick={this.state.entrySelected === null ? null : this.onClickEditEntry}>
                                    <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                                </button>
                                <button id="delete-entry" className={"button" + (this.state.entrySelected ? "" : " button-disabled")} onClick={this.state.entrySelected === null ? null : this.onDeleteEntry}>-</button>
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
                {dialogue}
            </div>
        );
    }
}

export default CreatePage;
