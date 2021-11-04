import React, {Component} from 'react';
import {isMobile} from "react-device-detect";

import Footer from './footer.js';
import Search from './search.js';
import SelectTable from './selectTable.js';
import CreateSheet from './createSheet.js';
import editImage from '../../images/edit.svg';


class CreatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addNewSheetOpen: false
        };
    }

    onClickAddNewSheet = () => {
        this.setState({addNewSheetOpen: true});
    };

    onClickBackMisc = () => {
        this.setState({
            addNewSheetOpen: false
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
            columns: ["Sheet", "% Complete", "# Entries"]
        };

        let entriesTableProps = {
            id: "entries-table",
            columns: ["Question", "Answer", "# Mentions", "Stars"]
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
                            <Search name="sheet query" />
                        </div>
                        <div className={isMobile ? null : "column"}>
                            <h2>Sheets</h2>
                            <div {...sheetTableContainerProps}>
                                <SelectTable {...sheetsTableProps} />
                            </div>
                            <div>
                                <button id="new-sheet" className="button" onClick={this.onClickAddNewSheet}>+</button>
                                <button id="edit-sheet" className="button button-disabled">
                                    <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                                </button>
                                <button id="delete-sheet" className="button button-disabled">-</button>
                            </div>
                        </div>
                        <div className={isMobile ? null : "column"}>
                            <h2>Entry</h2>
                            <div {...entryTableContainerProps}>
                                <SelectTable {...entriesTableProps} />
                            </div>
                            <div>
                                <button id="new-entry" className="button">+</button>
                                <button id="edit-entry" className="button button-disabled">
                                    <img src={editImage} style={{height: "24px", verticalAlign: "middle"}}></img>
                                </button>
                                <button id="delete-entry" className="button button-disabled">-</button>
                            </div>
                        </div>
                        <div style={{clear: "both"}}>
                            <p>
                                <button id="back" className="button" onClick={this.onClickBackMisc}>
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
