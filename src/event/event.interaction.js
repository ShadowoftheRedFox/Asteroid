/// <reference path="../../ts/type.d.ts"/>
function MouseTrackerManager() {
    throw new StaticClassError("This is a static class.");
}

MouseTrackerManager.data = {
    lastMove: {
        // init false coordinate to prevent bug
        x: -100,
        y: -100
    },
    lastMoveTrue: {
        // init false coordinate to prevent bug
        x: -100,
        y: -100
    },
    old: {
        // init false coordinate to prevent bug
        x: -100,
        y: -100
    },
    /**
     * @type {{x: number, y: number, date: number}[]}
     */
    click: [{ x: -100, y: -100, date: 0 }],
    hold: false
};

MouseTrackerManager.init = function () {
    document.onmousedown = function (ev) { MouseTrackerManager.OnMouseClick(ev); };
    document.onmousemove = function (ev) { MouseTrackerManager.OnMouseMove(ev); };
    document.onmouseup = function (ev) { MouseTrackerManager.OnMouseUnclick(ev); };
};

/**
 * @param {MouseEvent} event 
 */
MouseTrackerManager.OnMouseMove = function (event) {
    MouseTrackerManager.data.lastMove = { x: event.clientX, y: event.clientY };
    MouseTrackerManager.data.lastMoveTrue = { x: event.clientX, y: event.clientY };
    MouseTrackerManager.moving = true;
    MouseTrackerManager.update();
    MouseTrackerManager.stopedMoved({ x: event.clientX, y: event.clientY });

    MouseTrackerManager.data.hold.x = event.clientX;
    MouseTrackerManager.data.hold.y = event.clientY;
};

MouseTrackerManager.moving = false;
MouseTrackerManager.stopedMoved = function (old) {
    // to "vanish" the cursor if it stopped moving at the next frame
    // so that you can freely use the keyboard even if the cursor is hover a button
    if (MouseTrackerManager.moving) {
        setTimeout(() => {
            if (MouseTrackerManager.data.lastMove.x == old.x && MouseTrackerManager.data.lastMove.y == old.y) {
                MouseTrackerManager.data.old = { x: old.x, y: old.y };
                MouseTrackerManager.data.lastMove = { x: -10, y: -10 };
            }
        }, 1000 / GameConfig.targetFps);
        MouseTrackerManager.moving = false;
    }
};

/**
 * @param {MouseEvent} event 
 */
MouseTrackerManager.OnMouseClick = function (event) {
    MouseTrackerManager.data.click.push({
        x: event.clientX,
        y: event.clientY,
        date: Date.now()
    });
    // remove too old click
    if (MouseTrackerManager.data.click.length > 20) {
        MouseTrackerManager.data.click.shift();
    }
    MouseTrackerManager.update();

    MouseTrackerManager.data.hold = true;
};

/**
 * @param {MouseEvent} event 
 */
MouseTrackerManager.OnMouseUnclick = function (event) {
    MouseTrackerManager.data.hold = false;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @returns {boolean}
 */
MouseTrackerManager.holdOver = function (x, y, w, h) {
    if (this.checkOver(x, y, w, h, true) && this.data.hold === true) return true;
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
    const l = MouseTrackerManager.data.lastMove,
        o = MouseTrackerManager.data.old;
    if (l.x >= x && l.x <= x + w && l.y >= y && l.y <= y + h) return true;
    if (old == true && o.x >= x && o.x <= x + w && o.y >= y && o.y <= y + h) return true;
    return false;
};

MouseTrackerManager.trueCheckOver = function (x, y, w, h) {
    const l = MouseTrackerManager.data.lastMoveTrue;
    if (l.x >= x && l.x <= x + w && l.y >= y && l.y <= y + h) return true;
    return false;
};

/**
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number | 16.6} time
 * @returns {boolean}
 */
MouseTrackerManager.checkClick = function (x, y, w, h, time) {
    if (MouseTrackerManager.data.click.length === 0) return false;
    let c = MouseTrackerManager.data.click[MouseTrackerManager.data.click.length - 1];

    //check if click is new enough, under 100 ms [default]
    if (!time) time = 1000 / GameConfig.targetFps;
    if (Date.now() - c.date <= time) {
        if (c.x >= x && c.x <= x + w && c.y >= y && c.y <= y + h) {
            return true;
        } else {
            return false;
        }
    }
};

MouseTrackerManager.updated = false;
MouseTrackerManager.waitTimeUpdate = 1000 / GameConfig.targetFps;

MouseTrackerManager.update = function () {
    MouseTrackerManager.updated = true;
    setTimeout(() => {
        MouseTrackerManager.updated = false;
    }, MouseTrackerManager.waitTimeUpdate);
};

function KeyboardTrackerManager() {
    throw new Error("This is a static class.");
}

/**
 * Hold which keys are pressed and which are not.
 * @example
 * KeyboardTrackerManager.map => {
 *  "a":true,
 *  "b":false,
 *  " ":false
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
    onkeydown = document.onkeydown = function (ev) { KeyboardTrackerManager.onkeydown(ev); };
    onkeyup = document.onkeyup = function (ev) { KeyboardTrackerManager.onkeyup(ev); };
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