import React from 'react';
import ReactDOM from 'react-dom';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

import TopBar from './static/js/components/topbar.js';

function renderTopBar() {
    ReactDOM.render(<TopBar />, document.getElementById('topbar'));
}

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

if (localStorage.getItem("version") == undefined) {
    const newWorker = new Worker(
        new URL('./static/js/sql/initDB.js', import.meta.url)
    );
    newWorker.onmessage = function (event) {
        if (event.data.type == '__absurd:spawn-idb-worker') {
            return;
        }
        renderTopBar();
        worker.terminate();
    }
    initBackend(newWorker);
    window.worker = newWorker

    localStorage.setItem("version", "0.1.0");
}
else {
    renderTopBar();
}
