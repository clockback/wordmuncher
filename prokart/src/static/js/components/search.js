import React, {Component} from 'react';


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ""
        };
    }

    typeQuery = (event) => {
        this.setState({value: event.target.value}, function () {
            this.props.onChange(this.state.value);
        })
    };

    render() {
        return (
            <div className="input-box">
                <input id="search-all" autoComplete="off" placeholder="Search" name={this.props.name} onChange={this.typeQuery}></input>
                <div className="magnifying-glass">🔍</div>
            </div>
        );
    }
}

export default Search;
