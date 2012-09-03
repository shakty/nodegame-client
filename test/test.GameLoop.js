var util = require('util'),
	should = require('should');

var node = module.exports.node = require('./../index.js');

var PlayerList = node.PlayerList,
	Player = node.Player,
	GameDB = node.GameDB,
	GameState = node.GameState,
	GameLoop = node.GameLoop;

var test_gs = null,
	gs_321 = new GameState({
		state: 3,
		step: 2,
		round: 1,
	}),
	gs_331 = new GameState({
		state: 3,
		step: 3,
		round: 1,
	}),
	gs_311 = new GameState({
		state: 3,
		step: 1,
		round: 1,
	}),
	gs_111 = new GameState({
		state: 1,
		step: 1,
		round: 1,
	});

var game = { // The different, subsequent phases in each round
		
		1: {state: function(){},
			name: 'Creation'
		},
		
		2: {state: function(){},
			name: 'Evaluation'
		},
		
		3: {state: function(){},
			name: 'Exhibition'
		}
	};


var loop = {
		1: {state: function(){},
			name: 'Game will start soon'
		},
		
		2: {state: function(){},
			name: 'Instructions'
		},
		
		3: {rounds: 10, 
			state:  game,
			name: 'Game'
		}, 
		
		4: {state: function(){},
			name: 'Questionnaire'
		},
		
		5: {state: function(){},
			name: 'Thank you!'
		}
	};	

var gameLoop, test_gameLoop;

describe('GameLoop', function() {
	
	describe('#constructor()', function() {
		before(function(){
			gameLoop = new GameLoop(loop);
		});
		it('should result in a player list of length 1', function() {
			gameLoop.length.should.be.equal(35); // 34 + 0.0.0
		});
	});
	
	describe('#next()', function() {
		it('should return 1.1.1', function() {
			GameState.compare(gameLoop.next(),'1.1.1').should.be.equal(0); 
		});
		it('should return 2.1.1', function() {
			GameState.compare(gameLoop.next('1.1.1'),'2.1.1').should.be.equal(0); 
		});
		it('should return 3.1.1', function() {
			GameState.compare(gameLoop.next('2.1.1'),'3.1.1').should.be.equal(0); 
		});
		it('should return 3.2.1', function() {
			GameState.compare(gameLoop.next('3.1.1'),'3.2.1').should.be.equal(0); 
		});
		it('should return 3.3.1', function() {
			GameState.compare(gameLoop.next('3.2.1'),'3.3.1').should.be.equal(0); 
		});
		it('should return 3.1.2', function() {
			GameState.compare(gameLoop.next('3.3.1'),'3.1.2').should.be.equal(0); 
		});
		
		it('should return false when reached the end of the loop', function() {
			gameLoop.next('5.1.1').should.be.false; 
		});
	});
	
	describe('#previous()', function() {
		it('should return 1.1.1', function() {
			GameState.compare(gameLoop.previous('2.1.1'),'1.1.1').should.be.equal(0); 
		});
		it('should return 2.1.1', function() {
			GameState.compare(gameLoop.previous('3.1.1'),'2.1.1').should.be.equal(0); 
		});
		it('should return 3.1.1', function() {
			GameState.compare(gameLoop.previous('3.2.1'),'3.1.1').should.be.equal(0); 
		});
		it('should return 3.2.1', function() {
			GameState.compare(gameLoop.previous('3.3.1'),'3.2.1').should.be.equal(0); 
		});
		it('should return 3.3.1', function() {
			GameState.compare(gameLoop.previous('3.1.2'),'3.3.1').should.be.equal(0); 
		});
		
		it('should return false at the beginning of the loop', function() {
			gameLoop.previous('1.1.1').should.be.false; 
		});
	});
	
	describe('#jumpTo() forward', function() {
		it('should return 2.1.1', function() {
			GameState.compare(gameLoop.jumpTo('1.1.1', 1), '2.1.1').should.be.equal(0); 
		});
		it('should return 3.1.1', function() {
			GameState.compare(gameLoop.jumpTo('3.1.1', 1), '3.2.1').should.be.equal(0); 
		});
		it('should return 3.2.1', function() {
			GameState.compare(gameLoop.jumpTo('3.3.1', 1), '3.1.2').should.be.equal(0); 
		});
		it('should return 3.3.1', function() {
			GameState.compare(gameLoop.jumpTo('3.1.1', 2), '3.3.1').should.be.equal(0); 
		});
		it('should return 3.3.1', function() {
			GameState.compare(gameLoop.jumpTo('3.1.1', 5), '3.3.2').should.be.equal(0); 
		});
		it('should return false at the beginning of the loop', function() {
			gameLoop.jumpTo('5.1.1',1).should.be.false; 
		});
	});
	
	describe('#jumpTo() backward', function() {
		it('should return 1.1.1 (jump -1)', function() {
			GameState.compare(gameLoop.jumpTo('2.1.1', -1), '1.1.1').should.be.equal(0); 
		});
		it('should return 3.1.1 (jump -1)', function() {
			GameState.compare(gameLoop.jumpTo('3.2.1', -1), '3.1.1').should.be.equal(0); 
		});
		it('should return 3.3.1 (jump -1)', function() {
			GameState.compare(gameLoop.jumpTo('3.1.2', -1), '3.3.1').should.be.equal(0); 
		});
		it('should return 3.1.1 (jump -2)', function() {
			GameState.compare(gameLoop.jumpTo('3.3.1', -2), '3.1.1').should.be.equal(0); 
		});
		it('should return 3.1.1 (jump -5)', function() {
			GameState.compare(gameLoop.jumpTo('3.3.2', -5), '3.1.1').should.be.equal(0); 
		});
		it('should return false at the beginning of the loop', function() {
			gameLoop.jumpTo('1.1.1',-1).should.be.false; 
		});
	});
	
	
});