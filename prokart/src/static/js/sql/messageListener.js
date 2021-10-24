"use strict";

function addMessageListener(worker, func) {
    worker.addEventListener("message", function (event) {
        if (event.data.type != '__absurd:spawn-idb-worker') {
            func(event);
        }
    });
}

export {addMessageListener};
