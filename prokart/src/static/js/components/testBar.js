import React, {Component} from 'react';


class TestBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            noQuestion: 1
        };
    }

    render() {
        return (
            <div className="testbar">
                <div className="testbar-left">
                    <span tabIndex="0">
                        <svg width="50" height="25" style={{margin: "12.5px 0"}}>
                            <polygon points="0.0 12.5 22.5 0.0 22.5 7.5 25.0 10.0 47.5 10.0 50.0 12.5 50.0 15.0 47.5 17.5 25.0 17.5 22.5 20.0 22.5 25.0" style={{fill: "white"}}>
                            </polygon>
                        </svg>
                    </span>
                </div>
                <div className="testbar-center">
                    <div className="testbar-center-text">{this.state.noQuestion + " / " + this.props.noQuestions}</div>
                </div>
            </div>
        );
    }
}

export default TestBar;
