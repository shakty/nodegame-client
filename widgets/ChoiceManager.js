/**
 * # ChoiceManager
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Creates and manages a set of selectable choices forms (e.g. ChoiceTable).
 *
 * www.nodegame.org
 */
(function(node) {

    "use strict";

    var J = node.JSUS;

    node.widgets.register('ChoiceManager', ChoiceManager);

    // ## Meta-data

    ChoiceManager.version = '1.0.0';
    ChoiceManager.description = 'Groups together and manages a set of ' +
        'selectable choices forms (e.g. ChoiceTable).';

    ChoiceManager.title = 'Complete the forms below';
    ChoiceManager.className = 'choicemanager';

    // ## Dependencies

    ChoiceManager.dependencies = {
        JSUS: {}
    };

    /**
     * ## ChoiceManager constructor
     *
     * Creates a new instance of ChoiceManager
     *
     * @param {object} options Optional. Configuration options.
     *
     * @see ChoiceManager.init
     */
    function ChoiceManager(options) {
        var that;
        that = this;

        // TODO: move them in the Widgets as a check?
        if ('string' !== typeof options.id) {
            throw new TypeError('ChoiceManager constructor: options.id must ' +
                                'be string. Found: ' + options.id);
        }
        if (W.getElementById(options.id)) {
            throw new TypeError('ChoiceManager constructor: options.id is ' +
                                'not unique: ' + options.id);
        }

        /**
         * ### ChoiceManager.id
         *
         * The ID of the instance
         *
         * Will be used as the dl id, and as prefix for all choice TDs
         */
        this.id = options.id;

        /**
         * ### ChoiceManager.dl
         *
         * The clickable list containing all the forms
         */
        this.dl = null;

        /**
         * ### ChoiceManager.disabled
         *
         * Flag indicating if the event listener onclick is active
         */
        this.disabled = true;

        /**
         * ### ChoiceManager.mainText
         *
         * The main text introducing the choices
         *
         * @see ChoiceManager.spanMainText
         */
        this.mainText = null;

        /**
         * ### ChoiceManager.spanMainText
         *
         * The span containing the main text
         */
        this.spanMainText = null;

        /**
         * ### ChoiceManager.forms
         *
         * The array available forms
         */
        this.forms = null;


        /**
         * ### ChoiceManager.order
         *
         * The order of the forms as displayed (if shuffled)
         */
        this.order = null;

        /**
         * ### ChoiceManager.group
         *
         * The name of the group where the list belongs, if any
         */
        this.group = null;

        /**
         * ### ChoiceManager.groupOrder
         *
         * The order of the list within the group
         */
        this.groupOrder = null;

        /**
         * ### ChoiceManager.freeText
         *
         * If truthy, a textarea for free-text comment will be added
         *
         * If 'string', the text will be added inside the the textarea
         */
        this.freeText = null;

        /**
         * ### ChoiceManager.textarea
         *
         * Textarea for free-text comment
         */
        this.textarea = null;


        // Init.
        this.init(options);
    }

    // ## ChoiceManager methods

    /**
     * ### ChoiceManager.init
     *
     * Initializes the instance
     *
     * Available options are:
     *
     *   - className: the className of the list (string, array), or false
     *       to have none.
     *   - group: the name of the group (number or string), if any
     *   - groupOrder: the order of the list in the group, if any
     *   - onclick: a custom onclick listener function. Context is
     *       `this` instance
     *   - mainText: a text to be displayed above the list
     *   - shuffleForms: if TRUE, forms are shuffled before being added
     *       to the list
     *   - freeText: if TRUE, a textarea will be added under the list,
     *       if 'string', the text will be added inside the the textarea
     *   - timeFrom: The timestamp as recorded by `node.timer.setTimestamp`
     *       or FALSE, to measure absolute time for current choice
     *
     * @param {object} options Optional. Configuration options
     */
    ChoiceManager.prototype.init = function(options) {
        var tmp, that;
        options = options || {};
        that = this;

        // Option shuffleForms, default false.
        if ('undefined' === typeof options.shuffleForms) tmp = false;
        else tmp = !!options.shuffleForms;
        this.shuffleForms = tmp;


        // Set the group, if any.
        if ('string' === typeof options.group ||
            'number' === typeof options.group) {

            this.group = options.group;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceManager.init: options.group must ' +
                                'be string, number or undefined. Found: ' +
                                options.group);
        }

        // Set the groupOrder, if any.
        if ('number' === typeof options.groupOrder) {

            this.groupOrder = options.groupOrder;
        }
        else if ('undefined' !== typeof options.group) {
            throw new TypeError('ChoiceManager.init: options.groupOrder must ' +
                                'be number or undefined. Found: ' +
                                options.groupOrder);
        }

        // Set the mainText, if any.
        if ('string' === typeof options.mainText) {
            this.mainText = options.mainText;
        }
        else if ('undefined' !== typeof options.mainText) {
            throw new TypeError('ChoiceManager.init: options.mainText must ' +
                                'be string, undefined. Found: ' +
                                options.mainText);
        }

        // After all configuration options are evaluated, add forms.

        // Add the forms.
        if ('undefined' !== typeof options.forms) {
            this.setForms(options.forms);
        }

        // Creates a free-text textarea, possibly with an initial text
        if (options.freeText) {

            this.textarea = document.createElement('textarea');
            this.textarea.id = this.id + '_text';
            this.textarea.className = ChoiceManager.className + '-freetext';

            if ('string' === typeof options.freeText) {
                this.textarea.placeholder = options.freeText;
                this.freeText = options.freeText;
            }
            else {
                this.freeText = !!options.freeText;
            }
        }
    };

    /**
     * ### ChoiceManager.setForms
     *
     * Sets the available forms
     *
     * @param {array} forms The array of forms
     *
     * @see ChoiceManager.order
     * @see ChoiceManager.shuffleForms
     * @see ChoiceManager.buildForms
     * @see ChoiceManager.buildTableAndForms
     */
    ChoiceManager.prototype.setForms = function(forms) {
        var len;
        if (!J.isArray(forms)) {
            throw new TypeError('ChoiceTableGroup.setForms: ' +
                                'forms must be array.');
        }
        if (!forms.length) {
            throw new Error('ChoiceTableGroup.setForms: ' +
                            'forms is empty array.');
        }

        len = forms.length;
        this.formsSettings = forms;
        this.forms = new Array(len);

        // Save the order in which the choices will be added.
        this.order = J.seq(0, len-1);
        if (this.shuffleForms) this.order = J.shuffle(this.order);
    };

    /**
     * ### ChoiceManager.buildDl
     *
     * Builds the list of all forms
     *
     * Must be called after forms have been set already.
     *
     * @see ChoiceManager.setForms
     * @see ChoiceManager.order
     */
    ChoiceManager.prototype.buildDl = function() {
        var i, len, dt, dd;
        var form;

        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            dt = document.createElement('dt');
            dt.className = 'question';
            node.widgets.append(this.forms[this.order[i]], dt);
            dl.appendChild(dt);
        }
    };

    ChoiceManager.prototype.append = function() {

        if (this.mainText) {
            this.spanMainText = document.createElement('span');
            this.spanMainText.className = ChoiceManager.className + '-maintext';
            this.spanMainText.innerHTML = this.mainText;
            this.bodyDiv.appendChild(this.spanMainText);
        }

        if (this.dl) {
            this.dl = document.createElement('dl');
            this.buildDl();
            this.bodyDiv.appendChild(this.dl);
        }

        if (this.textarea) this.bodyDiv.appendChild(this.textarea);
    };

    ChoiceManager.prototype.listeners = function() {
        var that = this;
        node.on('INPUT_DISABLE', function() {
            that.disable();
        });
        node.on('INPUT_ENABLE', function() {
            that.enable();
        });
    };

    /**
     * ### ChoiceManager.disable
     *
     * Disables each form
     */
    ChoiceManager.prototype.disable = function() {
        var i, len;
        if (this.disabled) return;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].disable();
        }
    };

    /**
     * ### ChoiceManager.enable
     *
     * Enables each form
     */
    ChoiceManager.prototype.enable = function() {
        var i, len;
        if (!this.disabled) return;
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            this.forms[i].disable();
        }
    };

    /**
     * ### ChoiceManager.verifyChoice
     *
     * Compares the current choice/s with the correct one/s
     *
     * @param {boolean} markAttempt Optional. If TRUE, the value of
     *   current choice is added to the attempts array. Default
     *
     * @return {boolean|null} TRUE if current choice is correct,
     *   FALSE if it is not correct, or NULL if no correct choice
     *   was set
     *
     * @see ChoiceManager.attempts
     * @see ChoiceManager.setCorrectChoice
     */
    ChoiceManager.prototype.verifyChoice = function(markAttempt) {
        var i, len, obj, form;
        obj = {
            id: this.id,
            order: this.order,
            items: {}
        };
        // Mark attempt by default.
        markAttempt = 'undefined' === typeof markAttempt ? true : markAttempt;
        i = -1, len = this.items.length;
        for ( ; ++i < len ; ) {
            form = this.items[i];
            obj.items[form.id] = form.verifyChoice(markAttempt);
            if (!obj.items[form.id]) obj.fail = true;
        }
        return obj;
    };

    /**
     * ### ChoiceManager.unsetCurrentChoice
     *
     * Deletes the value for currentChoice
     *
     * If `ChoiceManager.selectMultiple` is set the
     *
     * @param {number|string} Optional. The choice to delete from currentChoice
     *   when multiple selections are allowed
     *
     * @see ChoiceManager.currentChoice
     * @see ChoiceManager.selectMultiple
     */
    ChoiceManager.prototype.unsetCurrentChoice = function(choice) {
        var i, len;
        if (!this.selectMultiple || 'undefined' === typeof choice) {
            this.currentChoice = null;
        }
        else {
            if ('string' !== typeof choice && 'number' !== typeof choice) {
                throw new TypeError('ChoiceManager.unsetCurrentChoice: ' +
                                    'choice must be string, number ' +
                                    'or undefined.');
            }
            i = -1, len = this.currentChoice.length;
            for ( ; ++i < len ; ) {
                if (this.currentChoice[i] === choice) {
                    this.currentChoice.splice(i,1);
                    break;
                }
            }
        }
    };

    /**
     * ### ChoiceManager.highlight
     *
     * Highlights the choice table
     *
     * @param {string} The style for the dl's border.
     *   Default '1px solid red'
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.highlight = function(border) {
        if (!this.dl) return;
        if (border && 'string' !== typeof border) {
            throw new TypeError('ChoiceManager.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        this.dl.style.border = border || '3px solid red';
        this.highlighted = true;
    };

    /**
     * ### ChoiceManager.unhighlight
     *
     * Removes highlight from the choice dl
     *
     * @see ChoiceManager.highlighted
     */
    ChoiceManager.prototype.unhighlight = function() {
        if (!this.dl) return;
        this.dl.style.border = '';
        this.highlighted = false;
    };

    /**
     * ### ChoiceManager.isHighlighted
     *
     * Returns TRUE if the choice dl is highlighted
     *
     * @return {boolean} ChoiceManager.highlighted
     */
    ChoiceManager.prototype.isHighlighted = function() {
        return this.highlighted;
    };

    /**
     * ### ChoiceManager.getAllValues
     *
     * Returns the values for current selection and other paradata
     *
     * Paradata that is not set or recorded will be omitted
     *
     * @param {object} opts Optional. Configures the return value.
     *   Available optionts:
     *
     *   - markAttempt: If TRUE, getting the value counts as an attempt
     *      to find the correct answer. Default: TRUE.
     *
     * @return {object} Object containing the choice and paradata
     *
     * @see ChoiceManager.verifyChoice
     */
    ChoiceManager.prototype.getAllValues = function(opts) {
        var obj, i, len;
        obj = {
            id: this.id,
            order: this.order
        };
        opts = opts || {};
        i = -1, len = this.forms.length;
        for ( ; ++i < len ; ) {
            obj[this.forms[i].id] = this.forms[i].getAllValues(opts);
        }
        if (this.textarea) obj.freetext = this.textarea.value;
        return obj;
    };

    // ## Helper methods.


})(node);
