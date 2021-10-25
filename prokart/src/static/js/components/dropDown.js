import React, {Component} from 'react';


class DropDown extends Component {
    onClickDropDown = () => {
        this.setState({selected: !this.state.selected});
    };

    state = {
        selected: false
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

        for (var i = 0; i < children.length; i ++) {
            updatedChildren.push(
                <div key={children[i].props.children}>{children[i].props.children}</div>
            );
        }

        return (
            <div id={this.props.id} className="custom-select">
                <select autoComplete="off">{children}</select>
                <div onClick={this.onClickDropDown} className={`select-selected${this.state.selected ? ' select-arrow-active' : ''}`}>{children[0].props.children}</div>
                <div className={`select-items ${!this.state.selected ? ' select-hide' : ''}`}>{updatedChildren}</div>
            </div>
        );
    }
}

export default DropDown;
