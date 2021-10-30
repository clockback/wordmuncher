import React, {Component} from 'react';
import DropDownOption from './dropDownOption.js';


class DropDown extends Component {
    state = {
        selected: false,
        currentI: 0
    };

    onClickDropDown = () => {
        this.setState({selected: !this.state.selected});
    };

    onChangeIndex = (i, text) => {
        this.setState({selected: false, currentI: i});
        this.props.callable(text);
    };

    render() {
        let children;
        let updatedChildren = [];

        if (!Array.isArray(this.props.children)) {
            children = [this.props.children];
        }
        else {
            children = this.props.children;
        }

        let varFirstIndex = 1;
        if (this.props.preserve == "true") {
            varFirstIndex = 0;
        }

        for (var i = varFirstIndex; i < children.length; i ++) {
            updatedChildren.push(
                <DropDownOption key={children[i].props.children} changeIndex={this.onChangeIndex} index={i} optionSelected={this.state.currentI == i}>{children[i].props.children}</DropDownOption>
            );
        }

        return (
            <div id={this.props.id} className="custom-select">
                <select autoComplete="off">{children}</select>
                <div onClick={this.onClickDropDown} className={`select-selected${this.state.selected ? ' select-arrow-active' : ''}`}>{children[this.state.currentI].props.children}</div>
                <div className={`select-items ${!this.state.selected ? ' select-hide' : ''}`}>{updatedChildren}</div>
            </div>
        );
    }
}

export default DropDown;
