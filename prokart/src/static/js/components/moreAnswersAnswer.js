import React, {Component} from 'react';


class MoreAnswersAnswer extends Component {
    constructor(props) {
        super(props);
    }

    onClick = (evt) => {
        this.props.onClick(this.props.i, this.props.text)
    };

    render() {
        let mainCellProps = {
            tabIndex: "0",
            onClick: this.onClick,
            style: {
                textDecoration: this.props.repeat ? "line-through" : null
            }
        };
        return (
            <tr>
                <td {...mainCellProps}>
                    {this.props.text}
                </td>
                <td>
                    <button className="trash-can">🗑️</button>
                </td>
            </tr>
        );
    }
}

export default MoreAnswersAnswer;
