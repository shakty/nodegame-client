/**
 * # nodeGame
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * ### nodeGame: Web Experiments in the Browser
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 * 
 */

(function (node) {

node.version = '0.7.5';

/**
 *  ## node.verbosity
 *  
 *  The minimum level for a log entry to be displayed as output.
 *   
 *  Defaults, only errors are displayed.
 *  
 */
node.verbosity = 0;
node.verbosity_levels = {
		// <!-- It is not really always... -->
		ALWAYS: -(Number.MIN_VALUE+1), 
		ERR: -1,
		WARN: 0,
		INFO: 1,
		DEBUG: 100
};

/**
 * ## node.log
 * 
 * Default nodeGame standard out, override to redirect
 * 
 * Default behavior is to output a text in the form: `nodeGame: some text`.
 * 
 * Logs entries are displayed only if their verbosity level is 
 * greater than `node.verbosity`
 * 
 * @param {string} txt The text to output
 * @param {string|number} level Optional. The verbosity level of this log. Defaults, level = 0
 * @param {string} prefix Optional. A text to display at the beginning of the log entry. Defaults prefix = 'nodeGame: ' 
 * 
 */
node.log = function (txt, level, prefix) {
	if ('undefined' === typeof txt) return false;
	
	level 	= level || 0;
	prefix 	= ('undefined' === typeof prefix) 	? 'nodeGame: '
												: prefix;
	if ('string' === typeof level) {
		level = node.verbosity_levels[level];
	}
	if (node.verbosity > level) {
		console.log(prefix + txt);
	}
};

// <!-- It will be overwritten later -->
node.game 		= {};
node.gsc 		= {};
node.session 	= {};
node.player 	= {};
node.memory 	= {};

// <!-- Load the auxiliary library if available in the browser -->
if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
if ('undefined' !== typeof store) node.store = store;

// <!-- if node
if ('object' === typeof module && 'function' === typeof require) {
    require('./init.node.js');
    require('./nodeGame.js');
}
// end node -->
	
})('object' === typeof module ? module.exports : (window.node = {}));	