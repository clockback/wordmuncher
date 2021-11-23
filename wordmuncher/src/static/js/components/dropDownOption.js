import React, {Component} from 'react';


class DropDownOption extends Component {
    decorateChangeIndex = () => {
        this.props.changeIndex(this.props.index, this.props.children);
    }

    render() {
        return (
            <div onClick={this.decorateChangeIndex} className={`${this.props.optionSelected ? "same-as-selected" : ""}`}>{this.props.children}</div>
        );
    }
}

export default DropDownOption;
