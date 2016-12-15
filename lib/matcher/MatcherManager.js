/**
 * # MatcherManager
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles matching roles to players and players to players.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    exports.MatcherManager = MatcherManager;

    /**
     * ## MatcherManager constructor
     *
     * Creates a new instance of role mapper
     */
    function MatcherManager(node) {

        /**
         * ### MatcherManager.node
         *
         * Reference to the node object
         */
        this.node = node;

        /**
         * ### MatcherManager.roler
         *
         * The roler object
         *
         * @see Roler
         */
        this.roler = new parent.Roler();

        /**
         * ### MatcherManager.matcher
         *
         * The matcher object
         *
         * @see Matcher
         */
        this.matcher = new parent.Matcher({ roler: this.roler });

        /**
         * ### MatcherManager.lastSettings
         *
         * Reference to the last settings parsed
         */
        this.lastSettings = null;

        /**
         * ### MatcherManager.lastMatches
         *
         * Reference to the last matches
         */
        this.lastMatches = null;

    }

    /**
     * ### MatcherManager.clear
     *
     * Clears current matches and roles
     *
     * @param {string} mod Optional. Modifies what must be cleared.
     *    Values: 'roles', 'matches', 'all'. Default: 'all'
     */
    MatcherManager.prototype.clear = function(mod) {
        switch(mod) {
        case 'roles':
            this.roler.clear();
            break;
        case 'matches':
            this.matcher.clear();
            break;
        default:
            this.roler.clear();
            this.matcher.clear();
        }
    };

    /**
     * ### MatcherManager.match
     *
     * Parses a conf object and returns the desired matches of roles and players
     *
     * Stores a reference of last matches.
     *
     * Returned matches are in a format which is ready to be sent out as
     * remote options. That is:
     *
     *     matches = [
     *         {
     *             id: 'playerId',
     *             options: {
     *                 role: "A", // optional.
     *                 partner: "XXX", // or object.
     *                 group: "yyy"
     *             }
     *         },
     *         // More matches...
     *     ];
     *
     * @param {object} settings The settings for the requested map
     *
     * @return {array} Array of matches ready to be sent out as remote options.
     *
     * @see MatcherManager.lastMatches
     */
    MatcherManager.prototype.match = function(settings) {
        var matches;

        // String is turned into object. Might still fail.
        if ('string' === typeof settings) settings = { match: settings };

        if ('object' !== typeof settings || settings === null) {
            throw new TypeError('MatcherManager.match: settings must be ' +
                                'object or string. Found: ' + settings);
        }

        if (settings.match === 'random_pairs' ||
            (settings.match === 'round_robin' ||
             settings.match === 'roundrobin')) {

            matches = randomPairs.call(this, settings);
        }
        else {
            throw new Error('MatcherManager.match: only "random_pairs" and ' +
                            '"round_robin" algorithms supported. Found: ' +
                            settings.match);
        }

        if (!matches || !matches.length) {
            throw new Error('MatcheManager.match: "' + settings.match +
                            '" did not return matches.');
        }

        this.lastMatches = matches;
        return matches;
    };

    /**
     * ### MatcherManager.getMatchFor
     *
     * Returns the match for the specified id
     *
     * @param {string} id The id to search a match for
     * @param {number} round Optional. Specifies a round other
     *   than current (will be normalized if there are more
     *   rounds than matches)
     *
     * @return {string|null} The current match for the id, or null
     *    if the id is not found
     */
    MatcherManager.prototype.getMatchFor = function(id, round) {
        if ('undefined' === typeof round) {
            round = this.getIterationRound();
        }
        else if ('number' === typeof round) {
            round = this.matcher.normalizeRound(round);
        }
        return this.matcher.getMatchFor(id, round);
    };

    /**
     * ### MatcherManager.getRoleFor
     *
     * Returns the role for the specified id
     *
     * @param {string} id The id to search a role for
     * @param {number} round Optional. Specifies a round other
     *   than current (will be normalized if there are more
     *   rounds than matches)
     *
     * @return {string|null} The role hold by id at the
     *    specified round or null if not found
     */
    MatcherManager.prototype.getRoleFor = function(id, round) {
        if ('undefined' === typeof round) {
            round = this.getIterationRound();
        }
        else if ('number' === typeof round) {
            round = this.matcher.normalizeRound(round);
        }
        return this.roler.getRoleFor(id, round);
    };

    /**
     * ### MatcherManager.getIterationRound
     *
     * Returns the pointer the round in the matcher (matches are cycled through)
     *
     * @return {number} The current iteration round
     *
     * @see Matcher.x
     * @see Matcher.hasNext
     */
    MatcherManager.prototype.getIterationRound = function() {
        return this.matcher.x || 0;
    };

    // ## Helper Methods

    /**
     * ## randomPairs
     *
     * Matches players and/or roles in random pairs
     *
     * Supports odd number of players, if 3 roles are given in settings.
     *
     * @param {object} settings The settings object
     *
     * @return {array} The array of matches.
     */
    function randomPairs(settings) {
        var r1, r2;
        var ii, i, len;
        var roundMatches, nMatchesIdx, match, id1, id2, soloId, missId;
        var matches,  sayPartner, doRoles;
        var opts, roles;

        var game, n;
        var nRounds;

        sayPartner = 'undefined' === typeof settings.sayPartner ?
            true : !!settings.sayPartner;

        doRoles = !!settings.roles;

        game = this.node.game;
        n = game.pl.size();

        // Settings the number of rounds.
        if ('undefined' !== typeof settings.rounds) {
            nRounds = settings.rounds;
        }
        else {
            nRounds = game.plot.getRound(game.getNextStep(), 'total');
        }
        if (nRounds > n-1) nRounds = n-1;

        // Algorithm: random.
        if (settings.match === 'random') {
            if (doRoles) {
                this.roler.clear();
                this.roler.setRoles(settings.roles, 2);
                this.matcher.init({ doRoles: doRoles });
            }
            this.matcher.generateMatches('random', n, {
                rounds: nRounds,
                // cycle: settings.cycle,
                skipBye: settings.skipBye,
                bye: settings.bye
            });
            this.matcher.setIds(game.pl.id.getAllKeys());
            // Generates new random matches for this round.
            this.matcher.match(true);
        }

        // Algorithm: round robin (but only if not already initialized
        // or if reInit = true).
        else {
            if (!this.matcher.matches || settings.reInit) {
                if (doRoles) {
                    this.roler.clear();
                    this.roler.setRoles(settings.roles, 2);
                    this.matcher.init({ doRoles: doRoles });
                }
                // Make a manual copy of settings object, and generate matches.
                this.matcher.generateMatches('roundrobin', n, {
                    rounds: nRounds,
                    cycle: settings.cycle,
                    skipBye: settings.skipBye,
                    bye: settings.bye
                });
                this.matcher.setIds(game.pl.id.getAllKeys());
                // Generates matches.
                this.matcher.match(true);
            }
            // Cycle through the matches, if we do not have enough.
            else if (!this.matcher.hasNext()) {
                this.matcher.init( { x: null, y: null });
            }
        }

        // Get all the matches for round x, and increments x.
        nMatchesIdx = 'number' === typeof this.matcher.x ?
            (this.matcher.x + 1) : 0;
        // This also increments the index matcher.x.
        roundMatches = this.matcher.getMatch(nMatchesIdx);

        len = roundMatches.length;

        // Contains one remoteOptions object per player.
        matches = ((n % 2) === 0) ?
            new Array((len*2)) :
            (settings.skipBye ? new Array((len*2)-2) : new Array((len*2)-1));

        // The id in case the number of player is odd.
        missId = this.matcher.missingId;

        // While we have matches, send them to clients.
        ii = i = -1;
        for ( ; ++i < len ; ) {
            ii++;
            match = roundMatches[i];
            id1 = match[0];
            id2 = match[1];

            // Verify that id1 and id2 are still connected.
            if (!game.pl.exist(id1)) id1 = missId;
            if (!game.pl.exist(id2)) id2 = missId;

            // If both id1 and id2 are disconnected, skip matching them.
            if (id1 === id2) {
                // Reduce matches array length.
                len--;
                matches.length--;
                continue;
            }

            if (doRoles) {
                roles = this.roler.rolesMap[nMatchesIdx][i];

                // Prepare options to send to player 1, if role1 is defined.
                r1 = roles[0];

                if (r1) {
                    if (!sayPartner) {
                        opts = { id: id1, options: { role: r1 } };
                    }
                    else {
                        opts = { id: id1, options: { role: r1, partner: id2 } };
                    }
                    // Add options to array.
                    matches[ii] = opts;
                }

                // Prepare options to send to player 2, if role2 is defined.
                r2 = roles[1];

                if (r2) {

                    // Increment ii index if both r1 and r2 are defined.
                    if (r1) ii++;

                    if (!sayPartner) {
                        opts = { id: id2, options: { role: r2 } };
                    }
                    else {
                        opts = { id: id2, options: { role: r2, partner: id1 } };
                    }
                    // Add options to array.
                    matches[ii] = opts;
                }
            }
            else if (sayPartner) {
                if (id1 !== missId) {
                    opts = { id: id1, options: { partner: id2 } };
                    matches[ii] = opts;
                }
                if (id2 !== missId) {
                    if (id1 !== missId) ii++;
                    opts2 = { id: id2, options: { partner: id1 } };
                    matches[ii] = opts;
                }
            }
        }

        // Store reference to last valid settings.
        this.lastSettings = settings;

        return matches;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);