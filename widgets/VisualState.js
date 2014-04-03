/**
 * # VisualState widget for nodeGame
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Shows current, previous and next state.
 *
 * www.nodegame.org
 * ---
 */
(function(node) {

    "use strict";

    node.widgets.register('VisualState', VisualState);

    var JSUS = node.JSUS,
    Table = node.window.Table;

    // ## Defaults

    VisualState.defaults = {};
    VisualState.defaults.id = 'visualstate';
    VisualState.defaults.fieldset = {
        legend: 'State',
        id: 'visualstate_fieldset'
    };

    // ## Meta-data

    VisualState.version = '0.2.1';
    VisualState.description = 'Visually display current, previous and next state of the game.';

    // ## Dependencies

    VisualState.dependencies = {
        JSUS: {},
        Table: {}
    };

    function VisualState(options) {
        this.id = options.id;

        this.root = null;
        this.table = new Table();
    }

    VisualState.prototype.getRoot = function() {
        return this.root;
    };

    VisualState.prototype.append = function(root, ids) {
        var that = this;
        var PREF = this.id + '_';
        root.appendChild(this.table.table);
        this.writeState();
        return root;
    };

    VisualState.prototype.listeners = function() {
        var that = this;

        node.on('STEP_CALLBACK_EXECUTED', function() {
            that.writeState();
        });

        // Game over and init?
    };

    VisualState.prototype.writeState = function() {
        var miss, state, pr, nx, tmp;
        var curStep, nextStep, prevStep;
        var t;

        miss = '-';
        state = 'Uninitialized';
        pr = miss;
        nx = miss;

        curStep = node.game.getCurrentGameStage();

        if (curStep) {
            tmp = node.game.plot.getStep(curStep);
            state = tmp ? tmp.id : miss;

            prevStep = node.game.plot.previous(curStep);
            if (prevStep) {
                tmp = node.game.plot.getStep(prevStep);
                pr = tmp ? tmp.id : miss;
            }

            nextStep = node.game.plot.next(curStep);
            if (nextStep) {
                tmp = node.game.plot.getStep(nextStep);
                nx = tmp ? tmp.id : miss;
            }
        }

        this.table.clear(true);

        this.table.addRow(['Previous: ', pr]);
        this.table.addRow(['Current: ', state]);
        this.table.addRow(['Next: ', nx]);

        t = this.table.select('y', '=', 2);
        t.addClass('strong');
        t.select('x','=',0).addClass('underline');
        this.table.parse();
    };

})(node);