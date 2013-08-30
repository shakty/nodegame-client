/**
 * # NodeGameClient Events Handling  
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * ---
 *
 */

(function (exports, parent) {


    var NGC = parent.NodeGameClient;
    
    /**
     * ### NodeGameClient.getCurrentEventEmitter
     *
     * Returns the last active event emitter obj
     *
     * TODO: finish the method
     *
     * TODO: add proper doc
     *
     * @param {EventEmitter} The current event emitter obj
     */
    NGC.prototype.getCurrentEventEmitter = function() {
        // NodeGame default listeners
        if (!this.game || !this.game.getCurrentGameStage()) {
            return this.events.ee.ng;
        }

        // It is a game init function
        if ((GameStage.compare(this.game.getCurrentGameStage(), new GameStage()) === 0 )) {
            return this.events.ee.game;
        }

        // TODO return the stage ee

        // It is a game step function
        else {
            return this.events.ee.step;
        }
    };

    /**
     * ### NodeGameClient.emit
     *
     * Emits an event locally on all registered event handlers
     *
     * The first parameter be the name of the event as _string_,
     * followed by any number of parameters that will be passed to the
     * handler callback.
     *
     * @see EventEmitterManager.emit
     */
    NGC.prototype.emit = function () {
        this.events.emit.apply(this.events, arguments);
    };

    /**
     * ### NodeGameClient.on
     *
     * Registers an event listener
     *
     * Listeners registered before a game is started, e.g. in
     * the init function of the game object, will stay valid
     * throughout the game. Listeners registered after the game
     * is started will be removed after the game has advanced
     * to its next stage.
     *
     * @param {string} event The name of the event
     * @param {function} listener The callback function
     */
    NGC.prototype.on = function (event, listener) {
        var ee;
        ee = this.getCurrentEventEmitter();
        ee.on(event, listener);
    };

    /**
     * ### NodeGameClient.once
     *
     * Registers an event listener that will be removed
     * after its first invocation
     *
     * @param {string} event The name of the event
     * @param {function} listener The callback function
     *
     * @see NodeGameClient.on
     * @see NodeGameClient.off
     */
    NGC.prototype.once = function (event, listener) {
        if (!event || !listener) return;
        this.on(event, listener);
        this.on(event, function(event, listener) {
            this.events.remove(event, listener);
        });
    };

    /**
     * ### NodeGameClient.off
     *
     * Deregisters one or multiple event listeners
     *
     * @param {string} event The name of the event
     * @param {function} listener The callback function
     *
     * @see NodeGameClient.on
     * @see NodeGameClient.EventEmitter.remove
     */
    NGC.prototype.off  = function (event, func) {
        return this.events.remove(event, func);
    };


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);