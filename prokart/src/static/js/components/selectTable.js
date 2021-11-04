import React, {Component} from 'react';
import {isMobile} from "react-device-detect";

import Footer from './footer.js';
import Search from './search.js';
import editImage from '../../images/edit.svg';


class SelectTable extends Component {
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
                visibility: "collapse",
                cursor: "pointer"
            }
        };

        let tableMoreCellProps = {
            className: "center-full-row",
            colSpan: this.props.columns.length
        };

        return (
            <table id={this.props.id}>
                <tbody className="header-row">
                    <tr>{columns}</tr>
                </tbody>
                <tbody className="main-rows"></tbody>
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
