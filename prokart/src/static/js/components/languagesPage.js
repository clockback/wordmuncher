import React, {Component} from 'react';
import DropDown from './dropDown.js';


class LanguagesPage extends Component {
    state = {
        fromLanguage: null,
        toLanguage: null
    };

    selectFromLanguage = (text) => {
        this.setState({fromLanguage: text});
    };

    selectToLanguage = (text) => {
        this.setState({toLanguage: text});
    };

    render() {
        return (
            <div>
                <div id="main" className="main" tabIndex="-1" datatabbable="false">
                    <div style={{marginLeft: "5px", marginTop: "10px"}}>
                        <p>
                            <button id="modify-languages" className="button">Modify languages</button>
                        </p>
                        <p>Translate from:</p>
                        <div style={{display: "inline-block", width: "300px"}}>
                            <DropDown id="translate-from" callable={this.selectFromLanguage}>
                                <option>Pick language:</option>
                            </DropDown>
                        </div>
                        <p>Translate to:</p>
                        <div style={{display: "inline-block", width: "300px"}}>
                            <DropDown id="translate-to" callable={this.selectToLanguage}>
                                <option>Pick language:</option>
                            </DropDown>
                        </div>
                    </div>
                    <p>
                        <button id="save-button" style={{marginTop: "10px"}} className={`button ${(this.state.fromLanguage !== null && this.state.toLanguage !== null && this.state.fromLanguage != this.state.toLanguage) ? "" : "button-disabled"}`}>Save</button>
                    </p>
                </div>
                <footer>
                    <div>Copyright © 2021 – Elliot Paton-Simpson</div>
                </footer>
            </div>
        );
    }
}

export default LanguagesPage;
