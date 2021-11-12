import React, {Component} from 'react';


class Slider extends Component {
    onChangeSlider = (evt) => {
        let bestI = 0;
        let bestDiff = 0;

        for (let i = 0; i < this.props.children.length; i ++) {
            let diff = Math.abs(
                this.props.children[i].props.children - evt.target.value
            );
            if (i == 0 || diff < bestDiff) {
                bestI = i;
                bestDiff = diff;
            }
        }

        this.props.changeCallback(this.props.children[bestI].props.children);
    };

    render() {
        return (
            <div style={{margin: "10px 0", display: "flex", alignItems: "center", flexDirection: "row"}}>
                <div style={{display: "inline-block"}}>
                    {this.props.description}
                </div>
                <div className="range-slider-container">
                    <input className="range-slider" min={this.props.children[0].props.children} max={this.props.children[this.props.children.length - 1].props.children} value={this.props.value} list={this.props.values} type="range" onChange={this.onChangeSlider} list="no-questions-options"></input>
                    <div>{this.props.value}</div>
                </div>
            </div>
        );
    }
}

export default Slider;
