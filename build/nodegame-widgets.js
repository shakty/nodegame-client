/**
 * 
 * # nodegame-widgets
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 */
(function (window, node) {

	var J = node.JSUS;
	
function Widgets() {
	this.widgets = {};
	this.root = W.root;
}

/**
 * ### Widgets.register
 * 
 * Registers a new widget in the collection
 * 
 * The widget is registered under the name of its constructor.
 * Optionally, a second parameter can specify the name under which
 * registering the widget.
 * 
 * Registered widgets can be loaded with Widgets.get or Widgets.append.
 * 
 * @param {string} name The id under which registering the widget
 * @param {function} w The widget to add
 * @return {boolean} TRUE, if registration is successful
 * 
 */
Widgets.prototype.register = function (name, prototype) {
	if (!name) {
		node.err('Could not register widget: ' + name, 'nodegame-widgets');
		return false;
	}
	this.widgets[name] = (prototype) ? new prototype.constructor() : new node.Widget();
	return this.widgets[name];
};

/**
 * ### Widgets.get
 * 
 * Retrieves, instantiates and returns the specified widget
 * 
 * It can attach standard javascript listeners to the root element of
 * the widget if specified in the options.
 * 
 * The dependencies are checked, and if the conditions are not met, 
 * returns FALSE.
 * 
 * @param {string} w_str The name of the widget to load
 * @param {options} options Optional. Configuration options to be passed to the widgets
 * 
 * @see Widgets.add
 * 
 * @TODO: add supports for any listener. Maybe requires some refactoring.
 * @TODO: add example.
 * 
 */
Widgets.prototype.get = function (w_str, options) {
	if (!w_str) return;
	var that = this;
	options = options || {};
	
	function attachListeners (options, w) {
		if (!options || !w) return;
		for (var i in options) {
			if (options.hasOwnProperty(i)) {
				if (J.in_array(i, ['onclick', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onload', 'onunload', 'onmouseover'])) {
					w.getRoot()[i] = function() {
						options[i].call(w);
					};
				}
			}			
		};
	};
	
	var w = J.getNestedValue(w_str, this.widgets);
	
	if (!w) {
		node.log('Widget ' + w_str + ' not found.', 'ERR');
		return;
	}
	
	node.log('nodeWindow: registering widget ' + w.name + ' v.' +  w.version);
	
	if (! this.checkDependencies(w)) return false;
	
	// Merging options with defaults
	options = J.merge(w.defaults || {}, options);
	
	
	try {
		w.constructor(options);

		// nodeGame listeners
		//w.listeners();
		// user listeners
		attachListeners(options, w);
		}
		catch(e){
			throw 'Error while loading widget ' + w.name + ': ' + e;
		}
	return w;
};

/**
 * ### Widgets.append
 * 
 * Appends a widget to the specified root element. If no root element
 * is specified the widget is append to the global root. 
 * 
 * The first parameter can be string representing the name of the widget or 
 * a valid widget already loaded, for example through Widgets.get. 
 * In the latter case, dependencies are checked, and it returns FALSE if
 * conditions are not met.
 * 
 * It automatically creates a fieldset element around the widget if 
 * requested by the internal widget configuration, or if specified in the
 * options parameter.
 * 
 * @param {string} w_str The name of the widget to load
 * @param {object} root. The HTML element to which appending the widget
 * @param {options} options Optional. Configuration options to be passed to the widgets
 * @return {object|boolean} The requested widget, or FALSE is an error occurs
 * 
 * @see Widgets.get
 * 
 */
Widgets.prototype.append = Widgets.prototype.add = function (w, root, options) {
	if (!w) return;
	var that = this;
	
	function appendFieldset(root, options, w) {
		if (!options) return root;
		var idFieldset = options.id || w.id + '_fieldset';
		var legend = options.legend || w.legend;
		return W.addFieldset(root, idFieldset, legend, options.attributes);
	};
	
	
	// Init default values
	root = root || this.root;
	options = options || {};

	// Check if it is a object (new widget)
	// If it is a string is the name of an existing widget
	// In this case a dependencies check is done
	if ('object' !== typeof w) w = this.get(w, options);
	if (!w) return false;	
	
	// options exists and options.fieldset exist
	root = appendFieldset(root, options.fieldset || w.defaults.fieldset, w);
	w.append(root);

	return w;
};

/**
 * ### Widgets.checkDependencies
 * 
 * Checks if all the dependencies are already loaded
 * 
 * Dependencies are searched for in the following objects
 * 
 *  	- window
 *  	- node
 *  	- this.widgets
 *  	- node.window
 * 
 * TODO: Check for version and other constraints.
 * 
 * @param {object} The widget to check
 * @param {boolean} quiet Optional. If TRUE, no warning will be raised. Defaults FALSE
 * @return {boolean} TRUE, if all dependencies are met
 */ 
Widgets.prototype.checkDependencies = function (w, quiet) {
	if (!w.dependencies) return true;
	
	var errMsg = function (w, d) {
		var name = w.name || w.id;// || w.toString();
		node.log(d + ' not found. ' + name + ' cannot be loaded.', 'ERR');
	};
	
	var parents = [window, node, this.widgets, node.window];
	
	var d = w.dependencies;
	for (var lib in d) {
		if (d.hasOwnProperty(lib)) {
			var found = false;
			for (var i=0; i<parents.length; i++) {
				if (J.getNestedValue(lib, parents[i])) {
					var found = true;
					break;
				}
			}
			if (!found) {	
				if (!quiet) errMsg(w, lib);
				return false;
			}
		
		}
	}
	return true;
};

//Expose Widgets to the global object
node.widgets = new Widgets();
	
})(
	// Widgets works only in the browser environment.
	('undefined' !== typeof window) ? window : module.parent.exports.window,
	('undefined' !== typeof window) ? window.node : module.parent.exports.node
);
// nodegame-widgets

(function (node) {

node.Widget = Widget;	
	
function Widget() {
	this.root = null;
}

Widget.prototype.dependencies = {};

Widget.prototype.defaults = {};

Widget.prototype.defaults.fieldset = {
	legend: 'Widget',
};


Widget.prototype.listeners = function () {};

Widget.prototype.getRoot = function () {
	return this.root;
};

Widget.prototype.getValues = function () {};

Widget.prototype.append = function () {};

Widget.prototype.init = function () {};

Widget.prototype.getRoot = function () {};

Widget.prototype.listeners = function () {};

Widget.prototype.getAllValues = function () {};

Widget.prototype.highlight = function () {};

})(
	// Widgets works only in the browser environment.
	('undefined' !== typeof node) ? node : module.parent.exports.node
);
(function (node) {

	var widget = node.widgets.register('GameSummary');
	

// ## Defaults
	
	widget.defaults.fieldset = {
		legend: 'Game Summary',
	};
	
// ## Meta-data
	
	widget.id = 'gamesummary';
	widget.name = 'Game Summary';
	widget.version = '0.3';
	widget.description = 'Show the general configuration options of the game.';
	
	widget.constructor = function (options) {
		this.summaryDiv = null;
	}
	
	widget.append = function (root) {
		this.root = root;
		this.summaryDiv = node.window.addDiv(root);
		this.writeSummary();
		return root;
	};
	
	widget.writeSummary = function (idState, idSummary) {
		var gName = document.createTextNode('Name: ' + node.game.name),
			gDescr = document.createTextNode('Descr: ' + node.game.description),
			gMinP = document.createTextNode('Min Pl.: ' + node.game.minPlayers),
			gMaxP = document.createTextNode('Max Pl.: ' + node.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.root, this.summaryDiv, idSummary);
	};

})(node);