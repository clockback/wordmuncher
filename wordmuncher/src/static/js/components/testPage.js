import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import Footer from './footer.js';
import Search from './search.js';
import SelectTable from './selectTable.js';
import TestSheetDialogue from './testSheetDialogue.js';
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


class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            query: "",
            sheets: [],
            moreSheets: false,
            openSheet: null
        };
    }

    componentDidMount() {
        getSheets(this.loadSheets);
    }

    onSearchSheets = (query) => {
        this.setState({
            query: query,
            sheets: [],
            moreSheets: false
        }, function () {
            getSheets(this.loadSheets, query);
        });
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

    selectSheet = (sheet) => {
        for (let i = 0; i < this.state.sheets.length; i ++) {
            if (this.state.sheets[i].id == sheet.idValues) {
                this.setState({
                    openSheet: this.state.sheets[i]
                });
            }
        }
    };

    closeSheet = () => {
        this.setState({
            openSheet: null
        });
    }

    render() {
        let selectTableProps = {
            columns: ["Sheet", "% Complete", "# Entries"],
            values: this.state.sheets,
            more: this.state.moreSheets,
            selectionCallback: this.selectSheet,
            closeDialogue: this.closeDialogue
        };

        let sheetDialogue = null;
        if (this.state.openSheet !== null) {
            sheetDialogue = (
                <TestSheetDialogue sheet={this.state.openSheet} closeDialogue={this.closeSheet} />
            );
        }

        return (
            <div>
                <div id="main" className="main" tabIndex="-1">
                    <div style={{marginLeft: "5px"}}>
                        <p>Select your sheet you would like to test:</p>
                        <Search onChange={this.onSearchSheets} />
                        <SelectTable {...selectTableProps} />
                    </div>
                </div>
                <Footer />
                {sheetDialogue}
            </div>
        );
    }
}

export default MainPage;
