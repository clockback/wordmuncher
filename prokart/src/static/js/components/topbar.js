import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

import logoDark from '../../images/logo-dark.svg';
import { addMessageListener } from '../sql/messageListener.js';
import TopBarTranslators from './topbarTranslators';


async function getTranslators(loadTranslators) {
    let worker = new Worker(
        new URL('../sql/getTranslators.js', import.meta.url)
    );
    initBackend(worker);

    addMessageListener(worker, function (event) {
        worker.terminate();
        loadTranslators(event.data);
    });
}

class TopBar extends Component {
    constructor(props) {
        super(props);

        let translators = localStorage.getItem("translators");

        this.state = {
            contents: (translators === undefined)
            ? null : JSON.parse(translators)
        };
    }

    componentDidMount() {
        getTranslators(this.loadTranslators);
    }

    loadTranslators = (contents) => {
        localStorage.setItem("translators", JSON.stringify(contents));
        this.setState({contents: contents});
    }

    clickSidebarIcon = e => {
        window.location.href = '/';
    };

    render() {
        let sidebarHomeProps = {
            id: "sidebar-left-home",
            tabIndex: "0",
            onClick: this.clickSidebarIcon
        };

        let homeImageProps = {
            style: {
                width: "40px",
                height: "40px"
            },
            src: logoDark
        };

        let sidebar = (
            <div className="sidebar">
                <div id="sidebar-left" className="sidebar-left">
                    <div {...sidebarHomeProps}>
                        <img {...homeImageProps}/>
                    </div>
                </div>
                <TopBarTranslators contents={this.state.contents} />
            </div>
        );

        return sidebar;
    }
}

export default TopBar;
