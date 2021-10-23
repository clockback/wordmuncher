import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from './static/js/components/topbar.js';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

ReactDOM.render(<TopBar />, document.getElementById('topbar'));

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

if (localStorage.getItem("version") == undefined) {
    let worker = new Worker(
        new URL('./static/js/sql/initDB.js', import.meta.url)
    );
    initBackend(worker);
    localStorage.setItem("version", "0.1.0");
}
