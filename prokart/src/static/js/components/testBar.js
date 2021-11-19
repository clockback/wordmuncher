import React, {Component} from 'react';


class TestBar extends Component {
    render() {
        let questionText = (
            (this.props.noQuestion > 0 ? this.props.noQuestion : 1)
            + " / " + this.props.noQuestions
        );

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
                    <div className="testbar-center-text">
                        {questionText}
                    </div>
                </div>
            </div>
        );
    }
}

export default TestBar;
