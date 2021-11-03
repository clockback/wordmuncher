import React, {Component} from 'react';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';
import { addMessageListener } from '../sql/messageListener.js';


async function pickTranslator(fromLanguage, toLanguage) {
    let worker = new Worker(
        new URL('../sql/pickTranslator.js', import.meta.url)
    );
    initBackend(worker);
    worker.postMessage({
        fromLanguage: fromLanguage, toLanguage: toLanguage
    });

    addMessageListener(worker, function (event) {
        worker.terminate();
        window.location.reload();
    });
}

class TopBarTranslators extends Component {
    clickTopButton = e => {
        if (e.target.innerHTML.trim() == "Start!") {
            window.location.href = "/languages";
        }
        else {
            window.location.reload();
        }
    }

    clickMoreTranslators = () => {
        window.location.href = "/languages";
    }

    clickTranslator = (event) => {
        let fromLanguage = (
            event.currentTarget.attributes["datafromlanguage"].nodeValue
        );
        let toLanguage = (
            event.currentTarget.attributes["datatolanguage"].nodeValue
        );

        let translators = JSON.parse(localStorage.getItem("translators"));
        let foundI = 0;
        for (let i = 1; i < translators.length; i ++) {
            if (
                translators[i].fromLanguage == fromLanguage
                && translators[i].toLanguage == toLanguage
            ) {
                foundI = i;
                break;
            }
        }

        if (foundI > 0) {
            let pickedTranslator = translators.splice(foundI, foundI)[0];
            translators.unshift(pickedTranslator);
            localStorage.setItem("translators", JSON.stringify(translators));
        }

        pickTranslator(fromLanguage, toLanguage);
    };

    render() {
        let contents = this.props.contents;

        if (contents === null) {
            return null;
        }

        let sidebarCenterTranslatorProps = {
            id: "sidebar-center-translator",
            className: "sidebar-center-button",
            style: {
                cursor: "pointer"
            },
            onClick: this.clickTopButton
        };

        let presentTranslator;
        if (contents.length > 0) {
            presentTranslator = (
                <div {...sidebarCenterTranslatorProps}>
                    {contents[0].fromLanguageFlag}
                    <div style={{fontWeight: "bold", padding: "0 5px", display: "inline-block"}}>
                        →
                    </div>
                    {contents[0].toLanguageFlag}
                </div>
            );
        }
        else {
            presentTranslator = (
                <div {...sidebarCenterTranslatorProps}>Start!</div>
            );
        }

        let dropDownTranslators = [];
        for (var i = 1; i < contents.length; i ++) {
            let dropDownTranslatorProps = {
                className: "sidebar-center-button",
                onClick: this.clickTranslator,
                style: {
                    cursor: "pointer"
                },
                datafromlanguage: contents[i].fromLanguage,
                datatolanguage: contents[i].toLanguage
            };

            dropDownTranslators.push(
                <div key={i}>
                    <div {...dropDownTranslatorProps}>
                        {contents[i].fromLanguageFlag}
                        <div style={{fontWeight: "bold", padding: "0 5px", display: "inline-block"}}>
                            →
                        </div>
                        {contents[i].toLanguageFlag}
                    </div>
                </div>
            );
        }

        let moreProps = {
            className: "sidebar-center-button",
            onClick: this.clickMoreTranslators,
            style: {
                cursor: "pointer"
            }
        };

        dropDownTranslators.push(
            <div key={contents.length}>
                <div {...moreProps}>
                    More
                </div>
            </div>
        );

        return (
            <div id="sidebar-center" className="sidebar-center">
                {presentTranslator}
                <div className="sidebar-center-drop">
                    {dropDownTranslators}
                </div>
            </div>
        );
    }
}

export default TopBarTranslators;
