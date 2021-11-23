import React, {Component} from 'react';
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';

import Footer from './footer.js';
import Search from './search.js';
import SelectTable from './selectTable.js';
import TestSheetDialogue from './testSheetDialogue.js';
import {addMessageListener} from '../sql/messageListener.js';
import starImage from '../../images/star.svg'


class ResultsPage extends Component {
    constructor(props) {
        super(props);

        let rows = [];

        let results = JSON.parse(sessionStorage.getItem("results"));

        let totalCorrect = 0;
        let total = results.length;

        for (let i = 0; i < total; i ++) {
            let found = false;
            let j;
            for (j = 0; j < rows.length; j ++) {
                if (results[i].question == rows[j].question) {
                    found = true;
                    break;
                }
            }

            if (results[i].correct) {
                totalCorrect += 1;
            }

            if (!found) {
                rows.push({
                    question: results[i].question,
                    correct: results[i].correct ? 1 : 0,
                    incorrect: results[i].correct ? 0 : 1,
                    completed: results[i].completed,
                    lastWasCorrect: results[i].correct,
                    stars: results[i].stars
                });
            }
            else {
                if (results[i].correct) {
                    rows[j].correct += 1;
                }
                else {
                    rows[j].incorrect += 1;
                }

                rows[j].lastWasCorrect = results[i].correct;
                rows[j].completed = results[i].completed;
                rows[j].stars = results[i].stars;
            }
        }

        this.state = {
            rows: rows,
            totalCorrect: totalCorrect,
            total: total
        };
    }

    finish = () => {
        window.location.href = '/test';
    };

    render() {
        let finishButtonProps = {
            id: "finish-button",
            className: "button",
            onClick: this.finish
        };

        let rows = [];

        for (let i = 0; i < this.state.rows.length; i ++) {
            let rowClass;
            if (this.state.rows[i].completed) {
                rowClass = "completed-colour";
            }
            else if (this.state.rows[i].lastWasCorrect) {
                rowClass = "incomplete-colour";
            }
            else {
                rowClass = "failed-colour";
            }

            let stars = [];
            for (let j = 0; j < this.state.rows[i].stars; j ++) {
                stars.push(
                    <img key={j} src={starImage}></img>
                );
            }

            rows.push(
                <tr key={i} className={rowClass}>
                    <td>{this.state.rows[i].question}</td>
                    <td>{this.state.rows[i].correct}</td>
                    <td>{this.state.rows[i].incorrect}</td>
                    <td>{stars}</td>
                </tr>
            );
        }

        let scoreTextProps = {
            style: {
                fontWeight: "bold",
                fontSize: "25px"
            }
        };

        return (
            <div>
                <div className="main">
                    <div style={{marginLeft: "5px"}}>
                        <p>
                            <span style={{paddingRight: "10px"}}>Score:</span>
                            <span {...scoreTextProps}>
                                {this.state.totalCorrect} / {this.state.total}
                            </span>
                        </p>
                        <table>
                            <tbody className="header-row">
                                <tr>
                                    <th>Question</th>
                                    <th># Correct</th>
                                    <th># Incorrect</th>
                                    <th>Stars</th>
                                </tr>
                            </tbody>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                        <div style={{marginTop: "10px"}}>
                            <button {...finishButtonProps}>
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }
}

export default ResultsPage;
