import React, {Component} from 'react';
import MoreAnswersAnswer from './moreAnswersAnswer.js';


class MoreAnswers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            incompleteAnswer: ""
        };
    }

    onChangeIncompleteAnswer = (event) => {
        this.setState({
            incompleteAnswer: event.target.value
        })
    };

    onProcessIncompleteAnswer = () => {
        let updatedSolutions = this.props.solutions;

        if (
            this.state.incompleteAnswer.length > 0
            && this.state.incompleteAnswer.length <= 80
            && this.state.incompleteAnswer != this.props.mainAnswer
        ) {
            updatedSolutions.push(this.state.incompleteAnswer);
        }

        this.setState({
            incompleteAnswer: ""
        });
        this.props.updateSolutions(updatedSolutions);
    };

    onKeyDown = (evt) => {
        if (evt.keyCode === 13) {
            this.onProcessIncompleteAnswer();
        }
    };

    promoteAnswer = (i, text) => {
        let promoteText = text;
        let demoteText = this.props.mainAnswer;
        this.props.promoteAnswer(promoteText);
        let updatedSolutions = this.props.solutions;

        if (
            demoteText.length == 0 || this.props.solutions.includes(demoteText)
        ) {
            updatedSolutions.splice(i, 1);
        }
        else {
            updatedSolutions[i] = demoteText;
        }

        this.props.updateSolutions(updatedSolutions);
    };

    render() {
        let solutions = [];
        for (let i = 0; i < this.props.solutions.length; i ++) {
            solutions.push(
                <MoreAnswersAnswer key={i} onClick={this.promoteAnswer} text={this.props.solutions[i]} i={i} repeat={this.props.solutions[i] == this.props.mainAnswer} />
            );
        }

        return (
            <div style={{overflowX: "auto", overflowY: "hidden"}}>
                <table className="selectable-table">
                    <tbody className="main-rows main-rows-alt">
                        {solutions}
                        <tr>
                            <td>
                                <input id="new-entry-add-answer" placeholder="Add another" style={{padding: "5px", autoComplete: "off", tabIndex: "0"}} value={this.state.incompleteAnswer} onChange={this.onChangeIncompleteAnswer} onKeyDown={this.onKeyDown}></input>
                            </td>
                            <td>
                                <span className="add-row" onClick={this.onProcessIncompleteAnswer}>➡</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default MoreAnswers;
