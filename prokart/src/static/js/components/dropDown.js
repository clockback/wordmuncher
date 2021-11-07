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
        if (this.props.preserve === true) {
            varFirstIndex = 0;
        }

        for (var i = varFirstIndex; i < children.length; i ++) {
            let optionProps = {
                key: children[i].props.children,
                changeIndex: this.onChangeIndex,
                index: i,
                optionSelected: this.state.currentI == i
            };

            updatedChildren.push(
                <DropDownOption {...optionProps}>
                    {children[i].props.children}
                </DropDownOption>
            );
        }

        let selectedDivProps = {
            onClick: this.onClickDropDown,
            className: "select-selected" + (
                this.state.selected ? " select-arrow-active" : ""
            )
        };

        let toggleItemsProps = {
            className: "select-items" + (
                !this.state.selected ? " select-hide" : ""
            )
        };

        return (
            <div id={this.props.id} className="custom-select">
                <select autoComplete="off">{children}</select>
                <div {...selectedDivProps}>
                    {children[this.state.currentI].props.children}
                </div>
                <div {...toggleItemsProps}>{updatedChildren}</div>
            </div>
        );
    }
}

export default DropDown;
