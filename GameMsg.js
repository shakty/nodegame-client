(function (exports, node) {

	var GameState = node.GameState;
	var Utils = node.Utils;
	
	/**
	 * Exposing constructor
	 */
	exports.GameMsg = GameMsg;
	/*
	 * JSON Data Format for nodeGame Apps.
	 */
	GameMsg.actions = {};
	GameMsg.targets = {};
	
	GameMsg.actions.SET 	= 'set'; 	// Changes properties of the receiver
	GameMsg.actions.GET 	= 'get'; 	// Ask a properties of the receiver
	GameMsg.actions.SAY		= 'say'; 	// Announce properties of the sender
	
	GameMsg.targets.HI		= 'HI';		// Introduction
	GameMsg.targets.STATE	= 'STATE';	// STATE
	GameMsg.targets.PLIST 	= 'PLIST';	// PLIST
	GameMsg.targets.TXT 	= 'TXT';	// Text msg
	GameMsg.targets.DATA	= 'DATA';	// Contains a data-structure in the data field
	
	GameMsg.targets.ACK		= 'ACK';	// A reliable msg was received correctly
	
	GameMsg.targets.WARN 	= 'WARN';	// To do.
	GameMsg.targets.ERR		= 'ERR';	// To do.
	
	GameMsg.IN				= 'in.';	// Prefix for incoming msgs
	GameMsg.OUT				= 'out.';	// Prefix for outgoing msgs
			
	
	/**
	 * Exporting constants
	 * 
	 */
//	exports.actions = GameMsg.actions;
//	exports.targets = GameMsg.targets;
//	
	
	function GameMsg (gm) {
		gm = gm || {};
		
		this.id = Math.floor(Math.random()*1000000);
		
		this.session = gm.session;
		this.state = gm.state;
		this.target = gm.target; // was action
		this.from = gm.from;
		this.to = gm.to;
		this.text = gm.text;
		this.action = gm.action; 
		this.data = gm.data;
		this.priority = gm.priority;
		this.reliable = gm.reliable;
		
		this.created = Utils.getDate();
		this.forward = 0; // is this msg just a forward?	
	};
	
	// Copy everything
	GameMsg.clone = function (gameMsg) {
		
		var gm = new GameMsg(gameMsg);
		
		gm.id = gameMsg.id;
		gm.forward = gameMsg.forward;
		// TODO: Check also created ?
		gm.created = gameMsg.created;
		
		return gm;
	};
	
	GameMsg.prototype.stringify = function() {
		return JSON.stringify(this);
	};
	
	GameMsg.prototype.toString = function() {
		
		var SPT = ",\t";
		var SPTend = "\n";
		var DLM = "\"";
		
		var gs = new GameState(this.state);
		
		var line = this.created + SPT;
			line += this.id + SPT;
			line += this.session + SPT;
			line += this.action + SPT;
			line += this.target + SPT;
			line +=	this.from + SPT;
			line += this.to + SPT;
			line += DLM + this.text + DLM + SPT;
			line += DLM + this.data + DLM + SPT; // maybe to remove
			line += this.reliable + SPT;
			line += this.priority + SPTend;
			
			
		return line;
		
	};
	
	GameMsg.prototype.toSMS = function () {
		
		var parseDate = /\w+/; // Select the second word;
		var results = parseDate.exec(this.created);
		//var d = new Date(this.created);
		//var line = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
		//var line = results[0];
		var line = '[' + this.from + ']->[' + this.to + ']\t';
		line += '|' + this.action + '.' + this.target + '|'+ '\t';
		line += ' ' + this.text + ' ';
		
		return line;
	};
	
	GameMsg.prototype.toInEvent = function() {
		return 'in.' + this.toEvent();
	};
	
	GameMsg.prototype.toOutEvent = function() {
		return 'out.' + this.toEvent();
	};
	
	GameMsg.prototype.toEvent = function () {
		return this.action + '.' + this.target;
	}; 
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);