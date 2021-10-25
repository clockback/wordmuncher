import React, {Component} from 'react';
import DropDown from './dropDown.js';


class LanguagesPage extends Component {
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
                            <DropDown id="translate-from">
                                <option value="0">Pick language:</option>
                            </DropDown>
                        </div>
                        <p>Translate to:</p>
                        <div style={{display: "inline-block", width: "300px"}}>
                            <DropDown id="translate-to">
                                <option value="0">Pick language:</option>
                            </DropDown>
                        </div>
                    </div>
                    <p>
                        <button id="save-button" style={{marginTop: "10px"}} className="button button-disabled">Save</button>
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
