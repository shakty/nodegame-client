/**
 * # nodeGame 
 * 
 * Social Experiments in the Browser
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 */

(function (node) {
	
module.exports = node;

// ## Libraries



/**
 * ### node.JSUS
 * 
 * @api public
 */

node.JSUS = require('JSUS').JSUS;

// Update compatibility report
node.support = node.JSUS.compatibility();

/**
 * ### node.NDDB
 * 
 * @api public
 */

node.NDDB = require('NDDB').NDDB;

/**
 * ### node.Socket.io-client
 * 
 * @api public
 */

node.io = require('socket.io-client');

/**
 * ### node.EventEmitter
 * 
 * @api public
 */

node.EventEmitter = require('./lib/core/EventEmitter').EventEmitter;

/**
 * ### node.GameState
 * 
 * @api public
 */

node.GameState = require('./lib/core/GameState').GameState;

/**
 * ### node.PlayerList
 * 
 * @api public
 */

node.PlayerList = require('./lib/core/PlayerList').PlayerList;

/**
 * ### node.Player
 * 
 * @api public
 */

node.Player = require('./lib/core/PlayerList').Player;


/**
 * ### node.GameMsg
 * 
 * @api public
 */

node.GameMsg = require('./lib/core/GameMsg').GameMsg;

/**
 * ### node.GameLoop
 * 
 * @api public
 */

node.GameLoop = require('./lib/core/GameLoop').GameLoop;


/**
 * ### node.GameMsgGenerator
 * 
 * @api public
 */

node.GameMsgGenerator = require('./lib/core/GameMsgGenerator').GameMsgGenerator;


/**
 * Expose SocketFactory
 * 
 * @api public
 */

node.SocketFactory = require('./lib/core/SocketFactory').SocketFactory;

/**
 * Expose Socket
 * 
 * @api public
 */

node.Socket = require('./lib/core/Socket').Socket;


/**
 * ### node.GameDB
 * 
 * @api public
 */

node.GameDB = require('./lib/core/GameDB').GameDB;

/**
 * ### node.GameBit
 * 
 * @api public
 */

node.GameBit = require('./lib/core/GameDB').GameBit;

/**
 * ### node.Game
 * 
 * @api public
 */

node.Game = require('./lib/core/Game').Game;


/**
 * Expose GameSession
 * 
 * @api public
 */
node.GameSession = require('./lib/core/Session').GameSession;


// ### Addons

node.GameTimer = require('./addons/GameTimer').GameTimer;

/**
 * ### node.TriggerManager
 * 
 * @api public
 */
node.TriggerManager = require('./addons/TriggerManager').TriggerManager;


/**
 * ### node.GameSession
 * 
 * @api public
 */
require('./addons/GameSession').GameSession;


})('undefined' != typeof node ? node : module.parent.exports);
