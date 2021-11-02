import React, {Component} from 'react';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

import closeImage from '../../images/close.svg';
import { addMessageListener } from '../sql/messageListener.js';


let checkNameWorker;
let x = 0;


async function checkLanguageName(languageName, permitName) {
    if (checkNameWorker) {
        checkNameWorker.terminate();
    }

    if (!languageName || languageName.length > 40) {
        permitName(false);
        return;
    }

    checkNameWorker = new Worker(
        new URL('../sql/checkLanguageName.js', import.meta.url)
    );
    initBackend(checkNameWorker);
    checkNameWorker.postMessage(languageName);

    addMessageListener(checkNameWorker, function (event) {
        checkNameWorker.terminate();
        permitName(event.data);
    });
}

async function addLanguageNameCheck(languageName, flag, onValid) {
    let worker = new Worker(
        new URL('../sql/addLanguage.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        languageName: languageName,
        flag: flag
    });

    addMessageListener(worker, function () {
        worker.terminate();
        onValid();
    });
}

async function findFlags(processFlags) {
    let worker = new Worker(
        new URL('../sql/findFlags.js', import.meta.url)
    );
    initBackend(worker);

    addMessageListener(worker, function (event) {
        worker.terminate();
        processFlags(event.data);
    });
}

class EditLanguages extends Component {
    constructor(props) {
        super(props);
        this.state = {
            languageName: "",
            flag: "🇬🇧",
            permitted: false,
            justOpened: false,
            addingLanguage: true,
            flagsVisible: false,
            flags: []
        };
        findFlags(this.loadFlags);
    }

    loadFlags = (data) => {
        this.state.flags = data;
    };

    openEditLanguages = () => {
        this.setState({justOpened: true});
    };

    closeEditLanguages = () => {
        this.props.closeCallable();
    };

    onPermitName = (allowed) => {
        this.setState({permitted: allowed});
    };

    onChangeLanguageName = (evt) => {
        this.setState({
            languageName: evt.target.value,
            permitted: false
        });
        checkLanguageName(evt.target.value, this.onPermitName);
    };

    onKeyDown = (evt) => {
        if (event.keyCode === 27) {
            this.closeEditLanguages();
        }
    };

    onAddLanguage = (evt) => {
        this.setState({permitted: false});
        addLanguageNameCheck(
            this.state.languageName, this.state.flag, function (total) {
                window.location.reload();
            }
        );
    }

    onToggleFlagsVisible = (evt) => {
        this.setState({flagsVisible: !this.state.flagsVisible})
    };

    onClickFlag = (evt) => {
        this.setState({flagsVisible: false, flag: evt.target.textContent});
    };

    render() {
        let dialogueProps = {
            id: "languages-container-background",
            className: "container-background container-background-transparent",
            onKeyDown: this.onKeyDown
        };

        let closeButtonDivProps = {
            style: {
                float: "right",
                marginRight: "10px",
                marginTop: "5px"
            },
            onClick: this.closeEditLanguages
        };

        let closeButtonProps = {
            src: closeImage,
            style: {
                height: "20px",
                width: "20px",
                cursor: "pointer"
            }
        };

        let dialogueContentsProps = {
            className: "container-contents",
            tabIndex: "-1",
            datatabbable: "false"
        };

        let addLanguageAreaProps = {
            id: "add-language",
            className: "boxed-area",
            style: {
                marginTop: "10px"
            }
        };

        let languageNameProps = {
            id: "language-name",
            placeholder: "Language name",
            value: this.state.languageName,
            autoComplete: "off",
            onChange: this.onChangeLanguageName
        };

        let flagsHiddenClass = (
            this.state.flagsVisible ? "" : " flag-drop-down"
        );

        let chooseFlagProps = {
            id: "choose-flag",
            className: "flag-drop" + flagsHiddenClass,
            onClick: this.onToggleFlagsVisible
        };

        let disableAddButton = this.state.permitted ? "" : " button-disabled";

        let addButtonProps = {
            id: "add-button",
            className: "button" + disableAddButton,
            onClick: this.state.permitted ? this.onAddLanguage : null
        };

        let hiddenFlagsProps = {
            id: "hidden-flags",
            style: {
                marginTop: "5px",
                borderTop: "1px solid grey",
                width: "100%",
                paddingTop: "5px",
                display: (this.state.flagsVisible) ? "" : "none"
            }
        };

        let backButtonProps = {
            id: "languages-back",
            className: "button",
            onClick: this.closeEditLanguages
        };

        let allHiddenFlags = [];


        for (var i = 0; i < this.state.flags.length; i ++) {
            let flag = this.state.flags[i];

            let tooltipButtonProps = {
                key: flag.text,
                className: "tooltip",
                style: {
                    display: "inline-block"
                }
            };

            let buttonProps = {
                className: "flag-button",
                onClick: this.onClickFlag
            };

            allHiddenFlags.push(
                <div {...tooltipButtonProps}>
                    <button {...buttonProps}>{flag.text}</button>
                    <span className="tooltip-text">{flag.country}</span>
                </div>
            );
        }

        return (
            <div {...dialogueProps}>
                <div className="container">
                    <div className="title-bar">
                        <div {...closeButtonDivProps}>
                            <img {...closeButtonProps}></img>
                        </div>
                    </div>
                    <div {...dialogueContentsProps}>
                        <div {...addLanguageAreaProps}>
                            <h2>Add language:</h2>
                            <div>
                                <div className="input-box">
                                    <input autoFocus {...languageNameProps}/>
                                </div>
                                <div className="flag-drop-parent">
                                    <div {...chooseFlagProps}>
                                        {this.state.flag}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button {...addButtonProps}>Add</button>
                            </div>
                            <div {...hiddenFlagsProps}>
                                {allHiddenFlags}
                            </div>
                        </div>
                        <p>
                            <button {...backButtonProps}>Back</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}

export default EditLanguages;
