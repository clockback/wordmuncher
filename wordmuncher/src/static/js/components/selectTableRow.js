import React, {Component} from 'react';

class SelectTableRow extends Component {
    selectRow = (event) => {
        this.props.selectRow(this.props.i);
    };

    render() {
        let rowsProps = {
            tabIndex: "0",
            style: {
                cursor: "pointer"
            },
            onClick: this.selectRow,
            className: this.props.className
        };

        return <tr {...rowsProps}>{this.props.children}</tr>
    }
}

export default SelectTableRow;
