import React, {Component} from 'react';


class Search extends Component {
    render() {
        return (
            <div className="input-box">
                <input id="search-all" autoComplete="off" placeholder="Search" name={this.props.name}></input>
                <div className="magnifying-glass">🔍</div>
            </div>
        );
    }
}

export default Search;
