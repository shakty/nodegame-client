var util = require('util');
    should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;
var GamePlot = ngc.GamePlot;
var J = ngc.JSUS;

var node = ngc.getClient();

module.exports = node;
node.verbosity = -1000;

function verySimple(stager) {
    stager.next('stage 1');
    stager.next('stage 2');
    stager.next('stage 3');
}

function simple(stager) {

    stager.next({
        id: 'stage 1',
        cb: function() {
            console.log('stage 1')
            node.done();
        }
    });

    stager.next('stage 2');

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() { console.log('step 2.2') }
    });

    stager.next('stage 3');


    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    // stager.endBlock();
}

var tmp, res;
var stager, stagerState;

describe('Stager', function() {

    describe('simple stage add', function() {
        before(function() {
            stager = ngc.getStager();
            // Adds 3 stages sequentially.
            verySimple(stager);
            console.log(stager);
        });
        it('should have 3 stages of 3 steps', function() {
            J.size(stager.stages).should.eql(3);
            J.size(stager.steps).should.eql(3);
        });
        it('should have 3 stages of 1 step each', function() {
            J.size(stager.stages).should.eql(3);
            J.size(stager.steps).should.eql(3);
        });

    });

});

// Setup.
// node.setup('plot', stagerState);
// node.createPlayer({ id: 'testid' });
// node.game.start({ step: false });

// // Step through.
// while (hasNextStep()) {
//     node.game.step();
//     tmp = node.game.getCurrentStepObj();
//     console.log('Stage id: ', tmp.id);
// }
//
// function hasNextStep() {
//     var curStep, nextStep;
//     curStep = node.game.getCurrentGameStage();
//     nextStep = node.game.plot.next(curStep);
//     return nextStep !== GamePlot.GAMEOVER && nextStep !== GamePlot.END_SEQ;
// }
//
// return;



function decorateStager(stager) {


    // stager.stageBlock('0..1');

    stager.next({
        id: 'stage 1',
        cb: function() {
            console.log('stage 1');
            node.done();
        }
    }, '0..1');

    // stager.endBlock();

    stager.stageBlock('0..1');

    stager.next('stage 2', '0..1');

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() { console.log('step 2.2') }
    });

    stager.next('stage 3', '0..1');

    stager.endBlock();

    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    // stager.endBlock();
}

function decorateStagerRepeat(stager) {


    stager.stage({
        id: 'stage 1',
        cb: function() { console.log('stage 1') }
    });

    stager.repeat('stage 2', 2);

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() { console.log('step 2.2') }
    });

    stager.repeat('stage 3', 1);


    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    // stager.endBlock();
    stager.setOnGameOver(function() {
        console.log('Game over!');
    });
}


function decorateStagerLoop(stager) {
    var counter;
    counter = 0;

    stager.loop(
        {
            id: 'stage 1',
            cb: function() {
                counter++;
                console.log('stage 1')
            }
        },
        function() {
            return counter < 3;
        }
    );

    stager.loop('stage 2', function() {
        return counter < 5;
    });

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() {
            counter++;
            console.log('step 2.2')
        }
    });

    stager.loop('stage 3',  function() {
        // Notice: counter is double incremented when
        // hasNextStep is called.
        return ++counter < 6;
    });


    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    stager.setOnGameOver(function() {
        console.log('Game over!');
    });
}

function decorateStagerDoLoop(stager) {
    var counter;
    counter = 0;

    stager.doLoop(
        {
            id: 'stage 1',
            cb: function() {
                counter++;
                console.log('stage 1')
            }
        },
        function() {
            return counter < 3;
        }
    );

    stager.doLoop('stage 2', function() {
        return counter < 5;
    });

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() {
            counter++;
            console.log('step 2.2')
        }
    });

    stager.doLoop('stage 3',  function() {
        // Notice: counter is double incremented when
        // hasNextStep is called.
        // console.log(counter);
        return ++counter < 6;
    });

    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    stager.setOnGameOver(function() {
        console.log('Game over!');
    });

}

// decorateStagerRepeat(stager);
//
// debugger
//
// stager.skip('stage 2', 'step 2.2');
// console.log(stager.toSkip);
// console.log(stager.isSkipped('stage 2', 'step 2.1'));
//
// stager.finalize();
//
// debugger

// stager.reset();

// console.log(stager.getSequence('hsteps'));

// decorateStagerSimple(stager);

// stager.finalize();

// console.log(stager.getSequence('hsteps'));
// console.log(stager.blocks);

return

// Simple mode test:
console.log();
console.log('SIMPLE MODE');
console.log('===========');
stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);
stager.setDefaultGlobals({GLOB: 3.14});
stager.setDefaultProperties({myProp: 1});

var counter = 0;
var flag = false;

stager
    .repeat('main', 2)
    .loop('durr', function() {
            if (counter++ >= 3) return false;
            return true;
        })
    .next('blah')
    .next('durr AS durrurrurr')
    .gameover()
    ;

// Testing extraction:
console.log("Extraction of 'main':");
console.log(util.inspect(stager.extractStage('main'), false, 4));
console.log();
console.log("Extraction of ['blah', 'durrurrurr', 'blah']:");
console.log(util.inspect(stager.extractStage(['blah', 'durrurrurr', 'blah']),
                         false, 4));
console.log();

/*
console.log('Sequence (JS object):');
console.log(stager.getSequence('o'));
console.log();

console.log('Sequence (human readable stages):');
console.log(stager.getSequence('hstages'));
console.log();

console.log('Sequence (human readable steps):');
console.log(stager.getSequence('hsteps'));
console.log();

// Testing state getter/setter:
console.log('State:');
console.log(stager.getState());
console.log();
stager.setState(stager.getState());
console.log('State (after get+set):');
console.log(stager.getState());
console.log();

stager.seqTestRun(false);
*/


// Expert mode test:
/*
console.log();
console.log('EXPERT MODE');
console.log('===========');

stager.clear();

stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);

flag = false;

stager.registerNext('main', function() { return 'blah'; });
stager.registerGeneralNext(function() {
    if (!flag) { flag = true; return 'durr'; }
    return null;
});

// Testing state getter/setter:
console.log('State:');
console.log(stager.getState());
console.log();
stager.setState(stager.getState());
console.log('State (after get+set):');
console.log(stager.getState());
console.log();

stager.seqTestRun(true, 'main');
*/
