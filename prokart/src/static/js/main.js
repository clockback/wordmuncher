import {getById} from './utils.js';
import {prepareEventsTopBar} from './select_translator.js';

function prepareEventsMain() {
    getById("test-button").onclick = function () {
        window.location.href = "/test";
    };
    getById("create-button").onclick = function () {
        window.location.href = "/create";
    };

    prepareEventsTopBar();
}

window.addEventListener('load', prepareEventsMain);
