import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

import logoDark from '../../images/logo-dark.svg';
import { addMessageListener } from '../sql/messageListener.js';
import TopBarTranslators from './topbarTranslators';


function renderTopBarTranslators(data) {
    ReactDOM.render(
        <TopBarTranslators contents={data} />,
        document.getElementById('sidebar-center')
    );
}

async function getTranslators() {
    let worker = new Worker(
        new URL('../sql/getTranslators.js', import.meta.url)
    );
    initBackend(worker);

    addMessageListener(worker, function (event) {
        worker.terminate();
        renderTopBarTranslators(JSON.stringify(event.data));
    });
}

class TopBar extends Component {
    clickSidebarIcon = e => {
        window.location.href = '/';
    };

    render() {
        let sidebar = (
            <div className="sidebar">
                <div id="sidebar-left" className="sidebar-left">
                    <div id="sidebar-left-home" tabIndex="0" onClick={this.clickSidebarIcon}>
                        <img style={{width: "40px", height: "40px"}} src={logoDark}/>
                    </div>
                </div>
                <div id="sidebar-center" className="sidebar-center"></div>
            </div>
        );
        getTranslators();
        return sidebar;
    }
}

export default TopBar;
