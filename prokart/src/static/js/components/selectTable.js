import React, {Component} from 'react';
import {isMobile} from "react-device-detect";

import Footer from './footer.js';
import Search from './search.js';
import SelectTableRow from './selectTableRow.js';
import editImage from '../../images/edit.svg';


class SelectTable extends Component {
    selectRow = (i) => {
        let selection;
        if (this.props.selection == "single") {
            if (this.props.selectedIds == this.props.values[i].id) {
                selection = null;
            }
            else {
                selection = this.props.values[i].id;
            }
        }
        else if (this.props.selection == "multiple") {
            let updatedSelection = this.props.selectedIds;
            if (updatedSelection.includes(this.props.values[i].id)) {
                updatedSelection.splice(
                    updatedSelection.indexOf(this.props.values[i].id), 1
                );
            }
            else {
                updatedSelection.push(this.props.values[i].id);
            }

            selection = updatedSelection;
        }

        this.props.selectionCallback({
            toggled: i,
            idValues: selection
        });
    };

    render() {
        let columns = [];
        for (let i = 0; i < this.props.columns.length; i ++) {
            columns.push(
                <th key={i}>{this.props.columns[i]}</th>
            );
        }

        let tableMoreRowProps = {
            tabIndex: "0",
            style: {
                visibility: this.props.more ? null : "collapse",
                cursor: "pointer"
            },

        };

        let tableMoreCellProps = {
            className: "center-full-row",
            colSpan: this.props.columns.length
        };

        let rows = [];
        for (let i = 0; i < this.props.values.length; i ++) {
            let cells = [];
            for (let j = 0; j < this.props.columns.length; j ++) {
                cells.push(
                    <td key={j}>{this.props.values[i][j]}</td>
                );
            }

            let rowsProps = {
                key: i,
                selectRow: this.selectRow,
                i: i
            };

            if (this.props.selection == "single") {
                if (this.props.selectedIds == this.props.values[i].id) {
                    rowsProps.className = "selected-row";
                }
            }

            else if (this.props.selection == "multiple") {
                if (this.props.selectedIds.includes(this.props.values[i].id)) {
                    rowsProps.className = "selected-row";
                }
            }

            rows.push(
                <SelectTableRow {...rowsProps}>{cells}</SelectTableRow>
            );
        }

        return (
            <table id={this.props.id}>
                <tbody className="header-row">
                    <tr>{columns}</tr>
                </tbody>
                <tbody className="main-rows">
                    {rows}
                </tbody>
                <tbody>
                    <tr {...tableMoreRowProps}>
                        <td {...tableMoreCellProps}>Load more...</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default SelectTable;
