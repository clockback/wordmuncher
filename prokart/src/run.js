import React from 'react';
import ReactDOM from 'react-dom';
import TopBar from './static/js/components/topbar.js';
import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

ReactDOM.render(<TopBar />, document.getElementById('topbar'));

function init() {
    console.log("OH MY");
    let worker = new Worker(
        new URL('./static/js/sql/connect.js', import.meta.url)
    );
    initBackend(worker);
}

init();
