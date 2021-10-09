import {
    bindButtonKeyPressEvents, getById, openRequest
} from './utils.js';

function selectTranslator(from_l, to_l) {
    openRequest("/languages/set", [
        ["from", from_l], ["to", to_l]
    ], processSelectTranslator);
}

function processSelectTranslator(request) {
    if (document.location.href.endsWith('/languages')) {
        document.location = '/';
    }
    else {
        document.location.reload();
    }
}

function clickTopButton() {
    if (this.innerHTML.trim() == "Start!") {
        window.location.href = "/languages";
    }
    else {
        window.location.reload();
    }
}

export function prepareEventsTopBar() {
    getById("sidebar-left-home").onclick = function () {
        window.location.href = '/';
    };
    bindButtonKeyPressEvents("sidebar-left-home", function () {
        window.location.href = '/';
    });
    getById("sidebar-center-translator").onclick = clickTopButton;

    var sidebarCenterButtons = document.querySelectorAll(
        "[data-lang-from][data-lang-to]"
    );

    for (var i = 0; i < sidebarCenterButtons.length; i ++) {
        var button = sidebarCenterButtons[i];
        var language_from = button.getAttribute("data-lang-from");
        var language_to = button.getAttribute("data-lang-to");
        button.onclick = function () {
            selectTranslator(language_from, language_to);
        };
    }
}
