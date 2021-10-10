import {getById} from './utils.js'
import {prepareEventsTopBar} from './select_translator.js'

function prepareEventsNotFound() {
    document.querySelector("button").onclick = function () {
        window.location.href = "/";
    };

    prepareEventsTopBar();
}

window.addEventListener('load', prepareEventsNotFound);
