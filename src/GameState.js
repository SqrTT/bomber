const { Element, isOtherBomber, isBomb, settings, isBomber } = require("./Constants");
const Point = require('./Point');
const Player = require('./Player');
const Bomb = require('./Bomb');
const { GameStates } = require("./GameStates");
const boardSymbol = Symbol('boardProperly');


class GameState {
    constructor() {
        this._state = GameStates.OVER;
        this._tick = 0;
    }
    /**
     *
     * @param {number} pos
     */
    getXY(pos) {
        var x = pos % this.size;
        var y = Math.trunc(pos / this.size);
        return Point.pt(x, y);
    }
    findAll(element, board = this[boardSymbol]) {
        const result = [];

        for (var i = 0; i < this.doubleSize; i++) {
            if (board.charAt(i) === element) {
                result.push(this.getXY(i));
            }
        }
        return result;
    }
    /**
     *
     * @param {string} board
     */
    initBoard(board) {
        this.size = Math.sqrt(board.length);
        this[boardSymbol] = board;
        this.doubleSize = Math.pow(this.size, 2);

        this.walls = this.findAll(Element.WALL);
        this.destroyableWalls = this.findAll(Element.DESTROYABLE_WALL);

        this.blasts = [];
        this.destroyedWalls = [];
        this.destroyedBombs = [];
        /**
         * @type {Point[]}
         */
        const playerPoints = [].concat(
            this.findAll(Element.OTHER_BOMBERMAN),
            this.findAll(Element.OTHER_BOMB_BOMBERMAN));

        this.players = playerPoints.map(point => new Player(point.x, point.y));

        /**
         * @type {Player[]}
         */
        const heroPoints = ([].concat(
            this.findAll(Element.BOMBERMAN),
            this.findAll(Element.BOMB_BOMBERMAN))).map(point => new Player(point.x, point.y));

        this.hero = heroPoints.pop();

        this.meatChoppers = this.findAll(Element.MEAT_CHOPPER);
        this.perks = {
            [Element.BOMB_COUNT_INCREASE]: this.findAll(Element.BOMB_COUNT_INCREASE),
            [Element.BOMB_IMMUNE]: this.findAll(Element.BOMB_IMMUNE),
            [Element.BOMB_REMOTE_CONTROL]: this.findAll(Element.BOMB_REMOTE_CONTROL),
            [Element.BOMB_BLAST_RADIUS_INCREASE]: this.findAll(Element.BOMB_BLAST_RADIUS_INCREASE)
        };
        const self = this;
        /**
         *
         * @param {Point} bombPoint
         */
        function makeBomb(bombPoint) {
            const element = self.getAt(bombPoint.x, bombPoint.y);

            if (element === Element.BOMB_BOMBERMAN) {
                return new Bomb(-1, bombPoint.x, bombPoint.y, self.hero.bombsPower, 4);
            } else if (element === Element.OTHER_BOMB_BOMBERMAN) {
                const bomb = new Bomb(-1, bombPoint.x, bombPoint.y, 3, 4);
                const playerIdx = self.players.findIndex(pl => pl.equals(bombPoint));

                if (playerIdx > -1) {
                    bomb.owner = playerIdx;
                    bomb.power = self.players[playerIdx].bombsPower;
                }
                return bomb;
            } else {
                return new Bomb(undefined, bombPoint.x, bombPoint.y, 3, Number(element));
            }
        }
        /**
         * @type {Bomb[]}
         */
        this.bombs = ([].concat(
            this.findAll(Element.BOMB_TIMER_1).map(makeBomb),
            this.findAll(Element.BOMB_TIMER_2).map(makeBomb),
            this.findAll(Element.BOMB_TIMER_3).map(makeBomb),
            this.findAll(Element.BOMB_TIMER_4).map(makeBomb),
            this.findAll(Element.BOMB_TIMER_5).map(makeBomb),
            this.findAll(Element.BOMB_BOMBERMAN).map(makeBomb),
            this.findAll(Element.OTHER_BOMB_BOMBERMAN).map(makeBomb)
        ));
    }

    getBoardPos(x, y) {
        return y * this.size + x;
    }

    getAt(x, y) {
        return this[boardSymbol].charAt(this.getBoardPos(x, y));
    };

    updateBoard(boardString) {
        this[boardSymbol] = boardString;
        this.destroyableWalls = this.findAll(Element.DESTROYABLE_WALL);
        this.meatChoppers = this.findAll(Element.MEAT_CHOPPER).concat(this.findAll(Element.DEAD_MEAT_CHOPPER));

        this.players.forEach((player, playerID) => {
            if (player.alive) {
                const el = this.getAt(player.x, player.y);
                if (isOtherBomber(el)) {
                    if (el === Element.OTHER_BOMB_BOMBERMAN) {
                        const existingBomb = this.bombs.find(bomb => bomb.equals(player));
                        if (!existingBomb) {
                            this.bombs.push(new Bomb(playerID, player.x, player.y, player.bombsPower, undefined, player.rcBombCount > 0));
                            player.bombsCount--;
                            if (player.rcBombCount > 0) {
                                player.rcBombCount--
                            }
                        }
                    }
                    return;
                }
                if (isBomb(el)) {
                    const existingBomb = this.bombs.find(bomb => player.equals(bomb));
                    if (!existingBomb) {
                        this.bombs.push(new Bomb(playerID, player.x, player.y, player.bombsPower, undefined, player.rcBombCount > 0));
                        player.bombsCount--;
                        if (player.rcBombCount > 0) {
                            player.rcBombCount--
                        }
                    }
                }

                const nextPos = [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1]
                ].find(([dx, dy]) => {
                    const b = this.getAt(player.x + dx, player.y + dy);
                    return isOtherBomber(b);
                });

                if (nextPos) {
                    player.x += nextPos[0];
                    player.y += nextPos[1];

                    const newEl = this.getAt(player.x, player.y);
                    if (newEl === Element.OTHER_BOMB_BOMBERMAN) {
                        const existingBomb = this.bombs.find(bomb => player.equals(bomb));

                        if (!existingBomb) {
                            this.bombs.push(new Bomb(playerID, player.x, player.y, player.bombsPower, undefined, player.rcBombCount > 0));
                            player.bombsCount--;
                            if (player.rcBombCount > 0) {
                                player.rcBombCount--
                            }
                        }
                    }

                    // check perks
                    const radiusIncrease = this.perks[Element.BOMB_BLAST_RADIUS_INCREASE].find(rad => player.equals(rad));
                    if (radiusIncrease) {
                        player.bombsPower += settings.perkBombBlastRadiusInc;
                        player.bombsPowerTime += settings.timeoutBombCountInc;
                    }

                    const countIncrease = this.perks[Element.BOMB_COUNT_INCREASE].find(rad => player.equals(rad));
                    if (countIncrease) {
                        player.bombsCount = 3;
                        player.bombsCountTime += settings.timeoutBombCountInc;
                    }

                    const bombImmune = this.perks[Element.BOMB_IMMUNE].find(rad => player.equals(rad));
                    if (bombImmune) {
                        player.immuneTime = settings.timeoutBombImmune;
                    }

                    const bombRC = this.perks[Element.BOMB_REMOTE_CONTROL].find(rad => player.equals(rad));
                    if (bombRC) {
                        player.rcBombCount = settings.remoteControlCount;
                    }
                }
                else {
                    player.alive = false;
                }
            }
        });

        // check for new players
        const playerPoints = [].concat(
            this.findAll(Element.OTHER_BOMBERMAN),
            this.findAll(Element.OTHER_BOMB_BOMBERMAN));

        playerPoints.forEach(p => {
            if (this.players.every(e => !e.equals(p))) {
                this.players.push(new Player(p.x, p.y))
            }
        })

        const processHero = (player, playerID) => {
            if (player.alive) {
                const el = this.getAt(player.x, player.y);
                if (isBomber(el)) {
                    if (el === Element.BOMB_BOMBERMAN) {
                        const existingBomb = this.bombs.find(bomb => bomb.equals(player));
                        if (!existingBomb) {
                            this.bombs.push(new Bomb(playerID, player.x, player.y, player.bombsPower, undefined, player.rcBombCount > 0));
                            player.bombsCount--;
                            if (player.rcBombCount > 0) {
                                player.rcBombCount--
                            }
                        }
                    }
                    return;
                }
                if (isBomb(el)) {
                    const existingBomb = this.bombs.find(bomb => player.equals(bomb));
                    if (!existingBomb) {
                        this.bombs.push(new Bomb(playerID, player.x, player.y, player.bombsPower, undefined, player.rcBombCount > 0));
                        player.bombsCount--;
                        if (player.rcBombCount > 0) {
                            player.rcBombCount--
                        }
                    }
                }

                const nextPos = [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1]
                ].find(([dx, dy]) => {
                    const b = this.getAt(player.x + dx, player.y + dy);
                    return isBomber(b);
                });

                if (nextPos) {
                    player.x += nextPos[0];
                    player.y += nextPos[1];

                    const newEl = this.getAt(player.x, player.y);
                    if (newEl === Element.BOMB_BOMBERMAN) {
                        const existingBomb = this.bombs.find(bomb => player.equals(bomb));

                        if (!existingBomb) {
                            this.bombs.push(new Bomb(playerID, player.x, player.y, player.bombsPower, undefined, player.rcBombCount > 0));
                            player.bombsCount--;
                            if (player.rcBombCount > 0) {
                                player.rcBombCount--
                            }
                        }
                    }

                    // check perks
                    const radiusIncrease = this.perks[Element.BOMB_BLAST_RADIUS_INCREASE].find(rad => player.equals(rad));
                    if (radiusIncrease) {
                        player.bombsPower += settings.perkBombBlastRadiusInc;
                        player.bombsPowerTime += settings.timeoutBombCountInc;
                    }

                    const countIncrease = this.perks[Element.BOMB_COUNT_INCREASE].find(rad => player.equals(rad));
                    if (countIncrease) {
                        player.bombsCount = 3;
                        player.bombsCountTime += settings.timeoutBombCountInc;
                    }

                    const bombImmune = this.perks[Element.BOMB_IMMUNE].find(rad => player.equals(rad));
                    if (bombImmune) {
                        player.immuneTime = settings.timeoutBombImmune;
                    }

                    const bombRC = this.perks[Element.BOMB_REMOTE_CONTROL].find(rad => player.equals(rad));
                    if (bombRC) {
                        player.rcBombCount = settings.remoteControlCount;
                    }
                }
                else {
                    player.alive = false;
                }
            }
        };
        processHero(this.hero, -1);

        this.perks = {
            [Element.BOMB_COUNT_INCREASE]: this.findAll(Element.BOMB_COUNT_INCREASE),
            [Element.BOMB_IMMUNE]: this.findAll(Element.BOMB_IMMUNE),
            [Element.BOMB_REMOTE_CONTROL]: this.findAll(Element.BOMB_REMOTE_CONTROL),
            [Element.BOMB_BLAST_RADIUS_INCREASE]: this.findAll(Element.BOMB_BLAST_RADIUS_INCREASE)
        };

        // tick perks
        /**
         *
         * @param {Player} actor
         */
        function tickPerks(actor) {
            if (actor.immuneTime > 0) {
                actor.immuneTime--;
            }
            if (actor.bombsPowerTime > 0) {
                actor.bombsPowerTime--;
            } else {
                actor.bombsPower = settings.bombPower;
            }

            if (actor.bombsCountTime > 0) {
                actor.bombsCountTime--;
            } else {
                actor.bombsCount = 1;
            }

        }
        tickPerks(this.hero);
        this.players.filter(p => p.alive).forEach(tickPerks);


        this.bombs = this.bombs.filter(bomb => {
            if (!bomb.rc) {
                bomb.timer--;
                const isBombActive = bomb.timer > 0;

                if (!isBombActive) {
                    if (bomb.owner === -1) {
                        this.hero.bombsCount++;
                    } else {
                        bomb.owner !== undefined && this.players[bomb.owner].bombsCount++;
                    }
                }
                return isBombActive;
            } else {
                const el = this.getAt(bomb.x, bomb.y);
                if (
                    el !== Element.MEAT_CHOPPER
                    && el !== Element.OTHER_BOMB_BOMBERMAN
                    && el !== Element.BOMB_BOMBERMAN
                    && el !== Element.BOMB_TIMER_5
                ) {
                    if (bomb.owner === -1) {
                        this.hero.bombsCount++;
                    } else {
                        bomb.owner && this.players[bomb.owner].bombsCount++;
                    }
                    return false;
                }
            }

            return true;
        });
    }
    getState() {
        return this._state;
    }
    setState(state) {
        this._state = state;
    }
    tick(boardString) {
        if (boardString.includes(Element.BOMBERMAN) || boardString.includes(Element.BOMB_BOMBERMAN)) {
            if (this._state !== GameStates.IN_PROGRESS) {
                this._state = GameStates.IN_PROGRESS;
                this.resetTicks();
                this.initBoard(boardString);
            } else {
                this._tick++;
                this.updateBoard(boardString);
            }
        }
        else if (boardString.includes(Element.DEAD_BOMBERMAN) && GameStates.WAIT_FOR_START !== this._state) {
            if (this._state === GameStates.OVER) {
                this._state = GameStates.WAIT_FOR_START;
            } else {
                this._state = GameStates.OVER;
            }
        } else {
            this._state = GameStates.WAIT_FOR_START;
        }
    }
    resetTicks() {
        this._tick = 0;
    }
    getTick() {
        return this._tick;
    }
}
exports.GameState = GameState;
