import React, {Component} from 'react';


class ProgressBar extends Component {
    render() {
        let barChartProps = {
            className: "bar-chart",
            style: {
                width: `${this.props.value}%`,
            }
        };
        let textContents = `${this.props.value}% complete`;

        return (
            <div className="bar-chart-container">
                <div {...barChartProps}></div>
                <div className="bar-chart-figure">{textContents}</div>
            </div>
        );
    }
}

export default ProgressBar;
