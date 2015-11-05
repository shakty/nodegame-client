/**
 * # nodeGame
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Social Experiments in the Browser
 *
 * nodeGame is a free, open source, event-driven javascript framework
 * for on line, multiplayer games in the browser.
 */
(function(exports) {

    // ## Loading libraries

    // ### Dependencies
    exports.JSUS = require('JSUS').JSUS;
    exports.support = exports.JSUS.compatibility();
    exports.NDDB = require('NDDB').NDDB;

    // Costants
    exports.constants = require('./lib/modules/variables').constants;
    exports.stepRules = require('./lib/modules/stepRules').stepRules;

    // ErrorManager
    require('./lib/core/ErrorManager');

    // Events
    exports.EventEmitterManager =
        require('./lib/core/EventEmitter').EventEmitterManager;
    exports.EventEmitter = require('./lib/core/EventEmitter').EventEmitter;

    // Core
    exports.GameStage = require('./lib/core/GameStage').GameStage;
    exports.PlayerList = require('./lib/core/PlayerList').PlayerList;
    exports.Player = require('./lib/core/PlayerList').Player;
    exports.GameMsg = require('./lib/core/GameMsg').GameMsg;
    exports.Stager = require('./lib/core/Stager').Stager;
    exports.GamePlot = require('./lib/core/GamePlot').GamePlot;
    exports.GameMsgGenerator =
        require('./lib/core/GameMsgGenerator').GameMsgGenerator;

    // Sockets
    exports.SocketFactory = require('./lib/core/SocketFactory').SocketFactory;
    exports.Socket = require('./lib/core/Socket').Socket;

    require('./lib/sockets/SocketIo.js');
    require('./lib/sockets/SocketDirect.js');

    // Timer
    exports.Timer = require('./lib/core/Timer').Timer;

    // Game
    exports.GameDB = require('./lib/core/GameDB').GameDB;
    exports.GameBit = require('./lib/core/GameDB').GameBit;
    exports.Game = require('./lib/core/Game').Game;

    // Extra (to be tested)
    exports.GroupManager = require('./lib/core/GroupManager').GroupManager;
    exports.RoleMapper = require('./lib/core/RoleMapper').RoleMapper;
    exports.GameSession = require('./lib/core/Session').GameSession;

    // Addons
    exports.TriggerManager = require('./addons/TriggerManager').TriggerManager;

    // FS
    // exports.NodeGameFS = require('./lib/core/NodeGameFS').NodeGameFS;

    // Load main nodegame-client class.
    exports.NodeGameClient =
        require('./lib/core/NodeGameClient').NodeGameClient;

    // Load extensions to the prototype.

    require('./lib/modules/log.js');
    require('./lib/modules/setup.js');
    require('./lib/modules/alias.js');
    require('./lib/modules/events.js');
    require('./lib/modules/connect.js');
    require('./lib/modules/player.js');
    require('./lib/modules/ssgd.js');
    require('./lib/modules/commands.js');
    require('./lib/modules/extra.js');
    require('./lib/modules/getJSON.js');

    require('./lib/modules/variables.js');


    // ### Loading Event listeners.
    require('./listeners/incoming.js');
    require('./listeners/internal.js');
    require('./listeners/setups.js');
    require('./listeners/aliases.js');


    exports.getClient = function() {
        var node;
        node = new exports.NodeGameClient();
        node.constants = exports.constants;
        node.stepRules = exports.stepRules;

        // TODO: find a good way to incorpare all the classes
        // TODO: should they use the new operator?
        node.Stager = exports.Stager;
        node.stepRules = exports.stepRules;

        // Removed.
        // node.fs = new exports.NodeGameFS(node);

        return node;
    };

    exports.getStager = function(state) {
        return new exports.Stager(state);
    };

})(module.exports);
