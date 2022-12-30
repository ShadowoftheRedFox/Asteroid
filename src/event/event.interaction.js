/// <reference path="../../ts/type.d.ts"/>
function MouseTrackerManager() {
    throw new Error("This is a static class.");
}

MouseTrackerManager.holding = false;
MouseTrackerManager.moving = false;
MouseTrackerManager.lastMove = {};
MouseTrackerManager.oldMove = {};

MouseTrackerManager.init = function () {
    // since events are different between mobile and computer, we need different handlers
    if (Utils.isMobileDevice() === true) {
        window.addEventListener("touchstart", MouseTrackerManager.OnTouchStart);
        window.addEventListener("touchmove", MouseTrackerManager.OnTouchMove);
        window.addEventListener("touchend", MouseTrackerManager.OnTouchEnd);
    } else {
        // init the cursor data
        MouseTrackerManager.lastMove = {
            0: {
                x: -100,
                y: -100,
                date: 0,
                id: 0
            }
        };
        MouseTrackerManager.oldMove = {
            0: {
                x: -100,
                y: -100,
                date: 0,
                id: 0
            }
        };
        window.addEventListener("mousedown", MouseTrackerManager.OnMouseClick);
        window.addEventListener("mousemove", MouseTrackerManager.OnMouseMove);
        window.addEventListener("mouseup", MouseTrackerManager.OnMouseUnclick);
    }
};

/**
 * @param {TouchEvent} event 
 */
MouseTrackerManager.OnTouchStart = function (event) {
    MouseTrackerManager.holding = true;
    for (let i = 0; i < event.changedTouches.length; i++) {
        MouseTrackerManager.lastMove[event.changedTouches.item(i).identifier.toString()] = {
            x: event.changedTouches.item(i).clientX,
            y: event.changedTouches.item(i).clientY,
            date: Date.now(),
            id: event.changedTouches.item(i).identifier
        };
    }
};

/**
 * @param {TouchEvent} event 
 */
MouseTrackerManager.OnTouchEnd = function (event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
        delete MouseTrackerManager.lastMove[i.toString()];
    }
    if (Object.keys(MouseTrackerManager.lastMove).length === 0) MouseTrackerManager.holding = false;
};

/**
 * @param {TouchEvent} event 
 */
MouseTrackerManager.OnTouchMove = function (event) {
    MouseTrackerManager.moving = true;

    for (let i = 0; i < event.changedTouches.length; i++) {
        MouseTrackerManager.lastMove[event.changedTouches.item(i).identifier].x = event.changedTouches.item(i).clientX;
        MouseTrackerManager.lastMove[event.changedTouches.item(i).identifier].y = event.changedTouches.item(i).clientY;
        MouseTrackerManager.lastMove[event.changedTouches.item(i).identifier].date = Date.now();
        // there is no hover, so kinda useless, just stays here just in case
        // MouseTrackerManager.stopedMoved(MouseTrackerManager.lastMove[i.toString()]);
    }
};

/**
 * @param {MouseEvent} event 
 */
MouseTrackerManager.OnMouseMove = function (event) {
    MouseTrackerManager.moving = true;
    MouseTrackerManager.lastMove["0"] = { x: event.clientX, y: event.clientY, date: Date.now(), id: 0 };
    MouseTrackerManager.stopedMoved({ x: event.clientX, y: event.clientY, date: Date.now(), id: 0 });
};

MouseTrackerManager.stopedMoved = function (old) {
    // to "vanish" the cursor if it stopped moving at the next frame
    // so that you can freely use the keyboard even if the cursor is hover a button
    if (MouseTrackerManager.moving === true) {
        setTimeout(() => {
            if (MouseTrackerManager.lastMove[old.id].x === old.x && MouseTrackerManager.lastMove[old.id].y === old.y) {
                if (Utils.isMobileDevice === true) {
                    MouseTrackerManager.oldMove[old.id] = { x: old.x, y: old.y, date: old.date, id: old.id };
                }
                // we don't need to worry that it will be stuck in the object, if it's a touch, it will get deleted
                // only the cursor won't, and that's what we want
                if (MouseTrackerManager.lastMove[old.id]) {
                    MouseTrackerManager.lastMove[old.id] = { x: -10, y: -10, date: Date.now(), id: old.id };
                }
            }
        }, 1000 / window.game.GameLoop.fps);
        MouseTrackerManager.moving = false;
    }
};

/**
 * @param {MouseEvent} event 
 */
MouseTrackerManager.OnMouseClick = function (event) {
    MouseTrackerManager.holding = true;
};

/**
 * @param {MouseEvent} event 
 */
MouseTrackerManager.OnMouseUnclick = function (event) {
    MouseTrackerManager.holding = false;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {boolean}
 */
MouseTrackerManager.clickOver = function (x, y, w, h) {
    if (MouseTrackerManager.checkOver(x, y, w, h, true) && MouseTrackerManager.holding === true) return true;
    return false;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {boolean} old If we include check on old mouse coordinates
 * @returns {boolean}
 */
MouseTrackerManager.checkOver = function (x, y, w, h, old = false) {
    if (Utils.isMobileDevice() === false) {
        const l = MouseTrackerManager.lastMove["0"] || { x: -100, y: -100 },
            o = MouseTrackerManager.oldMove["0"] || { x: -100, y: -100 };
        if (l.x >= x && l.x <= x + w && l.y >= y && l.y <= y + h) {
            return true;
        }
        if (old === true && o.x >= x && o.x <= x + w && o.y >= y && o.y <= y + h) {
            return true;
        }
        return false;
    } else {
        let over = false;
        Object.keys(MouseTrackerManager.lastMove).forEach(e => {
            const t = MouseTrackerManager.lastMove[e];
            if (t.x >= x && t.x <= x + w && t.y >= y && t.y <= y + h) {
                over = true;
            }
        });
        return over;
    }
};

MouseTrackerManager.getCoos = function () {
    // TODO get all entries and put all cursor into an array, and return the array
    return MouseTrackerManager.lastMove[MouseTrackerManager.lastMove.length - 1];
};

function KeyboardTrackerManager() {
    throw new Error("This is a static class.");
}

/**
 * Hold which keys are pressed and which are not.
 * @example
 * KeyboardTrackerManager.map => {
 *  "a": true,
 *  "b": false,
 *  " ": false
 * }
 */
KeyboardTrackerManager.map = {};
/**
 * Hold which keys are currently being pressed.
 * @example
 * KeyboardTrackerManager.array => ["a", " ", "m"]
 */
KeyboardTrackerManager.array = [];

KeyboardTrackerManager.init = function () {
    window.addEventListener("keydown", KeyboardTrackerManager.onkeydown);
    window.addEventListener("keyup", KeyboardTrackerManager.onkeyup);
};

/**
 * @param {KeyboardEvent} ev 
 */
KeyboardTrackerManager.onkeydown = function (ev) {
    // remember this in map
    ev = ev || event; // to deal with IE
    KeyboardTrackerManager.map[ev.key] = true;

    // remember this in array
    if (KeyboardTrackerManager.array.indexOf(ev.key) == -1) KeyboardTrackerManager.array.push(ev.key);
};

/**
 * @param {KeyboardEvent} ev 
 */
KeyboardTrackerManager.onkeyup = function (ev) {
    // remember this in map
    ev = ev || event; // to deal with IE
    KeyboardTrackerManager.map[ev.key] = false;

    // remember this in array
    if (KeyboardTrackerManager.array.indexOf(ev.key) > -1) {
        KeyboardTrackerManager.array.splice(KeyboardTrackerManager.array.indexOf(ev.key), 1);
    }
};

KeyboardTrackerManager.pressed = function (array) {
    let result = false;
    array.forEach(a => {
        if (!!KeyboardTrackerManager.map[a]) result = true;
        else if (KeyboardTrackerManager.array.includes(a)) result = true;
    });
    return result;
};