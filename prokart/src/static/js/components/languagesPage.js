import React, {Component} from 'react';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

import DropDown from './dropDown.js';
import EditLanguages from './editLanguages.js';
import { addMessageListener } from '../sql/messageListener.js';
import Footer from './footer.js';

async function getLanguages(processLanguages) {
    let worker = new Worker(
        new URL('../sql/getLanguages.js', import.meta.url)
    );
    initBackend(worker);

    addMessageListener(worker, function (event) {
        worker.terminate();
        processLanguages(event.data);
    });
}

async function saveTranslator(fromLanguage, toLanguage) {
    let worker = new Worker(
        new URL('../sql/saveTranslator.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        fromLanguage: fromLanguage[0], toLanguage: toLanguage[0]
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        localStorage.removeItem("translators");
        window.location.href = "/";
    });
}

class LanguagesPage extends Component {
    constructor(props) {
        super(props);
        this.editLanguagesDialogue = React.createRef();
        this.state = {
            fromLanguage: null,
            toLanguage: null,
            isOpenEditLanguages: false,
            languages: []
        };
    }

    componentDidMount() {
        getLanguages(this.processLanguages);
    }

    processLanguages = (languages) => {
        this.setState({languages: languages});
    };

    selectFromLanguage = (text) => {
        this.setState({fromLanguage: text});
    };

    selectToLanguage = (text) => {
        this.setState({toLanguage: text});
    };

    openEditLanguages = () => {
        this.setState({isOpenEditLanguages: true});
    };

    closeEditLanguages = () => {
        this.setState({isOpenEditLanguages: false});
    };

    onClickSave = () => {
        saveTranslator(this.state.fromLanguage, this.state.toLanguage)
    }

    render() {
        let mainProps = {
            id: "main",
            className: "main",
            tabIndex: "-1"
        };

        let modifyLanguagesProps = {
            id: "modify-languages",
            className: "button",
            onClick: this.openEditLanguages,
            tabIndex: this.state.isOpenEditLanguages ? -1 : 0
        };

        let fromDropDownProps = {
            id: "translate-from",
            callable: this.selectFromLanguage
        };

        let toDropDownProps = {
            id: "translate-to",
            callable: this.selectToLanguage
        };

        let canSave = (
            this.state.fromLanguage !== null
            && this.state.toLanguage !== null
            && this.state.fromLanguage != this.state.toLanguage
        )

        let saveButtonProps = {
            id: "save-button",
            style: {
                marginTop: "10px"
            },
            className: "button" + (canSave ? "" : " button-disabled"),
            tabIndex: this.state.isOpenEditLanguages ? -1 : 0,
            onClick: canSave ? this.onClickSave : null
        };

        let editLanguages = null;
        if (this.state.isOpenEditLanguages) {
            let editLanguagesProp = {
                ref: this.editLanguagesDialogue,
                closeCallable: this.closeEditLanguages
            };
            editLanguages = (
                <EditLanguages {...editLanguagesProp}/>
            )
        }

        let languages = [
            <option key={0}>Pick language:</option>
        ];
        for (var i = 0; i < this.state.languages.length; i ++) {
            let language = this.state.languages[i];
            languages.push(
                <option key={i + 1}>{language.name} {language.text}</option>
            );
        }

        return (
            <div>
                <div {...mainProps}>
                    <div style={{marginLeft: "5px", marginTop: "10px"}}>
                        <p>
                            <button {...modifyLanguagesProps}>
                                Modify languages
                            </button>
                        </p>
                        <p>Translate from:</p>
                        <div style={{display: "inline-block", width: "300px"}}>
                            <DropDown {...fromDropDownProps}>
                                {languages}
                            </DropDown>
                        </div>
                        <p>Translate to:</p>
                        <div style={{display: "inline-block", width: "300px"}}>
                            <DropDown {...toDropDownProps}>
                                {languages}
                            </DropDown>
                        </div>
                    </div>
                    <p>
                        <button {...saveButtonProps}>Save</button>
                    </p>
                </div>
                <Footer />
                {editLanguages}
            </div>
        );
    }
}

export default LanguagesPage;
