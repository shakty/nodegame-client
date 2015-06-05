/**
 * # WaitingRoom
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Checks a list of requirements and displays the results
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('WaitingRoom', WaitingRoom);

    // ## Meta-data

    WaitingRoom.version = '0.1.0';
    WaitingRoom.description = 'Displays a waiting room for clients.';

    WaitingRoom.title = 'WaitingRoom';
    WaitingRoom.className = 'waitingRoom';

    // ## Dependencies

    WaitingRoom.dependencies = {
        JSUS: {},
        List: {}
    };

    /**
     * ## WaitingRoom constructor
     *
     * Instantiates a new WaitingRoom object
     *
     * @param {object} options
     */
    function WaitingRoom(options) {

        /**
         * ### WaitingRoom.callbacks
         *
         * Array of all test callbacks
         */
        this.connected = 0;

        /**
         * ### WaitingRoom.stillChecking
         *
         * Number of tests still pending
         */
        this.poolSize = 0;

        /**
         * ### WaitingRoom.withTimeout
         *
         * If TRUE, a maximum timeout to the execution of ALL tests is set
         */
        this.groupSize = 0;

        /**
         * ### WaitingRoom.timeoutTime
         *
         * The time in milliseconds for the timeout to expire
         */
        this.timeoutTime = null;

        /**
         * ### WaitingRoom.timeoutId
         *
         * The id of the timeout, if created
         */
        this.timeoutId = null;

        /**
         * ### WaitingRoom.summary
         *
         * Span summarizing the status of the tests
         */
        this.summary = null;

        /**
         * ### WaitingRoom.dots
         *
         * Looping dots to give the user the feeling of code execution
         */
        this.dots = null;

        /**
         * ### WaitingRoom.sayResultLabel
         *
         * The label of the SAY message that will be sent to the server
         */
        this.sayResultsLabel = options.sayResultLabel || 'requirements';

        /**
         * ### WaitingRoom.addToResults
         *
         *  Callback to add properties to result object sent to server
         */
        this.addToResults = options.addToResults || null;

        /**
         * ### WaitingRoom.onComplete
         *
         * Callback to be executed at the end of all tests
         */
        this.onComplete = null;

        /**
         * ### WaitingRoom.onSuccess
         *
         * Callback to be executed at the end of all tests
         */
        this.onSuccess = null;

        /**
         * ### WaitingRoom.onFailure
         *
         * Callback to be executed at the end of all tests
         */
        this.onFailure = null;

        /**
         * ### WaitingRoom.list
         *
         * `List` to render the results
         *
         * @see nodegame-server/List
         */
        // TODO: simplify render syntax.
        this.list = new W.List({
            render: {
                pipeline: renderResult,
                returnAt: 'first'
            }
        });

        function renderResult(o) {
            var imgPath, img, span, text;
            imgPath = '/images/' + (o.content.success ?
                                    'success-icon.png' : 'delete-icon.png');
            img = document.createElement('img');
            img.src = imgPath;

            // Might be the full exception object.
            if ('object' === typeof o.content.text) {
                o.content.text = extractErrorMsg(o.content.text);
            }

            text = document.createTextNode(o.content.text);
            span = document.createElement('span');
            span.className = 'requirement';
            span.appendChild(img);

            span.appendChild(text);
            return span;
        }
    }

    // ## WaitingRoom methods

    /**
     * ### WaitingRoom.init
     *
     * Setups the requirements widget
     *
     * Available options:
     *
     *   - requirements: array of callback functions or objects formatted as
     *      { cb: function [, params: object] [, name: string] };
     *   - onComplete: function executed with either failure or success
     *   - onFailure: function executed when at least one test fails
     *   - onSuccess: function executed when all tests succeed
     *   - maxWaitTime: max waiting time to execute all tests (in milliseconds)
     *
     * @param {object} conf Configuration object.
     */
    WaitingRoom.prototype.init = function(conf) {
        if ('object' !== typeof conf) {
            throw new TypeError('WaitingRoom.init: conf must be object.');
        }
        if (conf.requirements) {
            if (!J.isArray(conf.requirements)) {
                throw new TypeError('WaitingRoom.init: conf.requirements ' +
                                    'must be array or undefined.');
            }
            this.requirements = conf.requirements;
        }
        if ('undefined' !== typeof conf.onComplete) {
            if (null !== conf.onComplete &&
                'function' !== typeof conf.onComplete) {

                throw new TypeError('WaitingRoom.init: conf.onComplete must ' +
                                    'be function, null or undefined.');
            }
            this.onComplete = conf.onComplete;
        }
        if ('undefined' !== typeof conf.onSuccess) {
            if (null !== conf.onSuccess &&
                'function' !== typeof conf.onSuccess) {

                throw new TypeError('WaitingRoom.init: conf.onSuccess must ' +
                                    'be function, null or undefined.');
            }
            this.onSuccess = conf.onSuccess;
        }
        if ('undefined' !== typeof conf.onFailure) {
            if (null !== conf.onFailure &&
                'function' !== typeof conf.onFailure) {

                throw new TypeError('WaitingRoom.init: conf.onFailure must ' +
                                    'be function, null or undefined.');
            }
            this.onFailure = conf.onFailure;
        }
        if (conf.maxExecTime) {
            if (null !== conf.maxExecTime &&
                'number' !== typeof conf.maxExecTime) {

                throw new TypeError('WaitingRoom.init: conf.onMaxExecTime ' +
                                    'must be number, null or undefined.');
            }
            this.withTimeout = !!conf.maxExecTime;
            this.timeoutTime = conf.maxExecTime;
        }
    };

    /**
     * ### WaitingRoom.addWaitingRoom
     *
     * Adds any number of requirements to the requirements array
     *
     * Callbacks can be asynchronous or synchronous.
     *
     * An asynchronous callback must call the `results` function
     * passed as input parameter to communicate the outcome of the test.
     *
     * A synchronous callback must return the value immediately.
     *
     * In both cases the return is an array, where every item is an
     * error message. Empty array means test passed.
     *
     * @see this.requirements
     */
    WaitingRoom.prototype.addWaitingRoom = function() {
        var i, len;
        i = -1, len = arguments.length;
        for ( ; ++i < len ; ) {
            if ('function' !== typeof arguments[i] &&
                'object' !== typeof arguments[i] ) {

                throw new TypeError('WaitingRoom.addWaitingRoom: ' +
                                    'requirements must be function or object.');
            }
            this.requirements.push(arguments[i]);
        }
    };

    /**
     * ### WaitingRoom.checkWaitingRoom
     *
     * Asynchronously or synchronously checks all registered callbacks
     *
     * Can add a timeout for the max execution time of the callbacks, if the
     * corresponding option is set.
     *
     * Results are displayed conditionally
     *
     * @param {boolean} display If TRUE, results are displayed
     *
     * @return {array} The array containing the errors
     *
     * @see this.withTimeout
     * @see this.requirements
     */
    WaitingRoom.prototype.checkWaitingRoom = function(display) {
        var i, len;
        var errors, cbErrors, cbName, errMsg;
        if (!this.requirements.length) {
            throw new Error('WaitingRoom.checkWaitingRoom: no requirements ' +
                            'to check found.');
        }

        this.updateStillChecking(this.requirements.length, true);

        errors = [];
        i = -1, len = this.requirements.length;
        for ( ; ++i < len ; ) {
            // Get Test Name.
            if (this.requirements[i] && this.requirements[i].name) {
                cbName = this.requirements[i].name;
            }
            else {
                cbName = i + 1;
            }
            try {
                resultCb(this, name, i);
            }
            catch(e) {
                errMsg = extractErrorMsg(e);
                this.updateStillChecking(-1);

                errors.push('An exception occurred in requirement n.' +
                            cbName + ': ' + errMsg);
            }
        }

        if (this.withTimeout) {
            this.addTimeout();
        }

        if ('undefined' === typeof display ? true : false) {
            this.displayResults(errors);
        }

        if (this.isCheckingFinished()) {
            this.checkingFinished();
        }

        return errors;
    };

    /**
     * ### WaitingRoom.addTimeout
     *
     * Starts a timeout for the max execution time of the requirements
     *
     * Upon time out results are checked, and eventually displayed.
     *
     * @see this.stillCheckings
     * @see this.withTimeout
     * @see this.requirements
     */
    WaitingRoom.prototype.addTimeout = function() {
        var that = this;
        var errStr = 'One or more function is taking too long. This is ' +
            'likely to be due to a compatibility issue with your browser ' +
            'or to bad network connectivity.';

        this.timeoutId = setTimeout(function() {
            if (that.stillChecking > 0) {
                that.displayResults([errStr]);
            }
            that.timeoutId = null;
            that.hasFailed = true;
            that.checkingFinished();
        }, this.timeoutTime);
    };

    /**
     * ### WaitingRoom.clearTimeout
     *
     * Clears the timeout for the max execution time of the requirements
     *
     * @see this.timeoutId
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.clearTimeout = function() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    };

    /**
     * ### WaitingRoom.updateStillChecking
     *
     * Updates the number of requirements still running on the display
     *
     * @param {number} update The number of requirements still running, or an
     *   increment as compared to the current value
     * @param {boolean} absolute TRUE, if `update` is to be interpreted as an
     *   absolute value
     *
     * @see this.summaryUpdate
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.updateStillChecking = function(update, absolute) {
        var total, remaining;

        this.stillChecking = absolute ? update : this.stillChecking + update;

        total = this.requirements.length;
        remaining = total - this.stillChecking;
        this.summaryUpdate.innerHTML = ' (' +  remaining + ' / ' + total + ')';
    };

    /**
     * ### WaitingRoom.isCheckingFinished
     *
     * Returns TRUE if all requirements have returned
     *
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.isCheckingFinished = function() {
        return this.stillChecking <= 0;
    };

    /**
     * ### WaitingRoom.CheckingFinished
     *
     * Cleans up timer and dots, and executes final requirements accordingly
     *
     * First, executes the `onComplete` callback in any case. Then if no
     * errors have been raised executes the `onSuccess` callback, otherwise
     * the `onFailure` callback.
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.checkingFinished = function() {
        var results;

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.dots.stop();

        if (this.sayResults) {
            results = {
                success: !this.hasFailed,
                results: this.results
            };

            if (this.addToResults) {
                J.mixin(results, this.addToResults());
            }
            node.say(this.sayResultsLabel, 'SERVER', results);
        }

        if (this.onComplete) {
            this.onComplete();
        }

        if (this.hasFailed) {
            if (this.onFailure) this.onFailure();
        }
        else if (this.onSuccess) {
            this.onSuccess();
        }
    };

    /**
     * ### WaitingRoom.displayResults
     *
     * Displays the results of the requirements on the screen
     *
     * Creates a new item in the list of results for every error found
     * in the results array.
     *
     * If no error was raised, the results array should be empty.
     *
     * @param {array} results The array containing the return values of all
     *   the requirements
     *
     * @see this.onComplete
     * @see this.onSuccess
     * @see this.onFailure
     * @see this.stillCheckings
     * @see this.requirements
     */
    WaitingRoom.prototype.displayResults = function(results) {
        var i, len;

        if (!this.list) {
            throw new Error('WaitingRoom.displayResults: list not found. ' +
                            'Have you called .append() first?');
        }

        if (!J.isArray(results)) {
            throw new TypeError('WaitingRoom.displayResults: results must ' +
                                'be array.');
        }

        // No errors.
        if (!results.length) {
            // Last check and no previous errors.
            if (!this.hasFailed && this.stillChecking <= 0) {
                // All tests passed.
                this.list.addDT({
                    success: true,
                    text:'All tests passed.'
                });
            }
        }
        else {
            // Add the errors.
            i = -1, len = results.length;
            for ( ; ++i < len ; ) {
                this.list.addDT({
                    success: false,
                    text: results[i]
                });
            }
        }
        // Parse deletes previously existing nodes in the list.
        this.list.parse();
    };

    WaitingRoom.prototype.append = function() {

        this.summary = document.createElement('span');
        this.summary.appendChild(
            document.createTextNode('Evaluating requirements'));

        this.summaryUpdate = document.createElement('span');
        this.summary.appendChild(this.summaryUpdate);

        this.dots = W.getLoadingDots();

        this.summary.appendChild(this.dots.span);

        this.bodyDiv.appendChild(this.summary);

        this.bodyDiv.appendChild(this.list.getRoot());
    };

    WaitingRoom.prototype.listeners = function() {
        var that;
        that = this;
        node.registerSetup('requirements', function(conf) {
            if (!conf) return;
            if ('object' !== typeof conf) {
                node.warn('requirements widget: invalid setup object: ' + conf);
                return;
            }
            // Configure all requirements.
            that.init(conf);
            // Start a checking immediately if requested.
            if (conf.doChecking) that.checkWaitingRoom();

            return conf;
        });
    };

    WaitingRoom.prototype.destroy = function() {
        node.deregisterSetup('requirements');
    };

    // ## Helper methods

    function resultCb(that, name, i) {
        var req, update, res;

        update = function(success, errors, data) {
            that.updateStillChecking(-1);
            if (!success) {
                that.hasFailed = true;
            }

            if (errors) {
                if (!J.isArray(errors)) {
                    throw new Error('WaitingRoom.checkWaitingRoom: ' +
                                    'errors must be array or undefined.');
                }
                that.displayResults(errors);
            }

            that.results.push({
                name: name,
                success: success,
                errors: errors,
                data: data
            });

            if (that.isCheckingFinished()) {
                that.checkingFinished();
            }
        };

        req = that.requirements[i];
        if ('function' === typeof req) {
            res = req(update);
        }
        else if ('object' === typeof req) {
            res = req.cb(update, req.params || {});
        }
        else {
            throw new TypeError('WaitingRoom.checkWaitingRoom: invalid ' +
                                'requirement: ' + name + '.');
        }
        // Synchronous checking.
        if (res) update(res.success, res.errors, res.data);
    }

    function extractErrorMsg(e) {
        var errMsg;
        if (e.msg) {
            errMsg = e.msg;
        }
        else if (e.message) {
            errMsg = e.message;
        }
        else if (e.description) {
            errMsg.description;
        }
        else {
            errMsg = e.toString();
        }
        return errMsg;
    }

})(node);
