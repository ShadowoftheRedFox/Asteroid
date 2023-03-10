/// <reference path="../ts/type.d.ts"/>
console.time("Started game in");

// declare all needed global variables here
var GameAudiosToLoad = [];
var GameImagesToLoad = [];
//create a basic event emitter
const GameEvent = new class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return () => this.removeListener(event, listener);
    }
    removeListener(event, listener) {
        if (typeof this.events[event] === 'object') {
            const idx = this.events[event].indexOf(listener);
            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    }
    removeAllListener(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
    emit(event, ...args) {
        if (typeof this.events[event] === 'object') {
            this.events[event].forEach(listener => listener.apply(this, args));
        }
    }
    once(event, listener) {
        const remove = this.on(event, (...args) => {
            remove();
            listener.apply(this, args);
        });
    }
}();

// load all script
window.onload = ScriptLoaderManager.setup(StackLoadPlugin, 0, () => {
    ScriptLoaderManager.setup([].concat(
        StackLoadClass, StackLoadConfig,
        StackLoadCore, StackLoadEntity,
        StackLoadEvent, StackLoadFunction,
        StackLoadGlobal, StackLoadInterface,
        StackLoadManager, StackLoadUtil,
        StackLoadLanguage, StackLoadBuild
    ), 0, () => {
        // load all sounds
        DataLoaderManager.setup(StackLoadData, 0, () => {
            WindowManager.init();
            try {
                // launch manager
                LoadingScreenManager.init();
                KeyboardTrackerManager.init();
                MouseTrackerManager.init();
                // set a random title
                document.getElementById("title").innerText += `: ${ConfigConst.TITLE.random()}`;
                // start the game
                window.game = new Game();
            } catch (e) {
                WindowManager.fatal(e);
            }
        });
    });
});