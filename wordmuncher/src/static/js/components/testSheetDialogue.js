import React, {Component} from 'react';
import closeImage from '../../images/close.svg';
import ProgressBar from './progressBar.js';
import Slider from './slider.js';


class TestSheetDialogue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            noQuestions: 10
        }
    }

    changeNoSheets = (noSheets) => {
        this.setState({
            noQuestions: noSheets
        });
    };

    loadSheet = (event) => {
        sessionStorage.setItem("sheet", this.props.sheet.id);
        sessionStorage.setItem("sheetName", this.props.sheet[0]);
        sessionStorage.setItem("noQuestions", this.state.noQuestions);
        window.location.href = "/test-sheet";
    };

    render() {
        return (
            <div className="container-background container-background-transparent">
                <div className="container">
                    <div className="title-bar">
                        <div style={{float: "right", marginRight: "10px", marginTop: "5px"}} onClick={this.props.closeDialogue}>
                            <img src={closeImage} style={{height: "20px", width: "20px", cursor: "pointer"}}></img>
                        </div>
                    </div>
                    <div className="container-contents" tabIndex="-1">
                        <h1>{this.props.sheet[0]}</h1>
                        <ProgressBar value={this.props.sheet[1]} />
                        <Slider description="Number of questions:" value={this.state.noQuestions} changeCallback={this.changeNoSheets}>
                            <option>5</option>
                            <option>10</option>
                            <option>15</option>
                            <option>20</option>
                            <option>30</option>
                            <option>50</option>
                            <option>100</option>
                            <option>200</option>
                        </Slider>
                        <p>
                            <button className="button" onClick={this.loadSheet}>Go!</button>
                            <button className="button" onClick={this.props.closeDialogue}>Back</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default TestSheetDialogue;
