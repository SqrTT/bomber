
const { Element, isBomber, isWalkableElement, settings, DirectionList } = require('./Constants');
const Actor = require('./Actor');
const Point = require('./Point');
const Player = require('./Player');
const { GameState } = require('./GameState');
const Bomb = require('./Bomb');

const activeActors = [
    Element.BOMBERMAN,
    Element.BOMB_BOMBERMAN,
    Element.OTHER_BOMBERMAN,
    Element.OTHER_BOMB_BOMBERMAN,
    Element.MEAT_CHOPPER
];

function setCharAt(str, index, chr) {
    if (index > str.length - 1) return str;
    return str.substr(0, index) + chr + str.substr(index + 1);
}

const around = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
];

var contains = function (a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i].equals(obj)) {
            return true;
        }
    }
    return false;
};

var removeDuplicates = function (all) {
    var result = [];
    for (var index in all) {
        var point = all[index];
        if (!contains(result, point)) {
            result.push(point);
        }
    }
    return result;
};

class Board {
    /**
     *
     * @param {Point} moveToPoint
     * @param {Point[]} elements
     */
    countElementsAroundPt(moveToPoint, elements, distance = 1) {
        return this.getElementsAroundPt(moveToPoint, elements, distance).length;
    }

    getElementsAroundPt(moveToPoint, elements, distance = 1) {
        /**
         * @type {Point[]}
         */
        var elementsResult = [];
        var idx = elements.length;

        while (idx--) {
            var element = elements[idx];
            var aroundIdx = around.length;

            while (aroundIdx--) {
                var [dx, dy] = around[aroundIdx];
                var d = distance;
                for (var d = 1; d <= distance; d++) {
                    if (element.equalsTo((dx * d) + moveToPoint.x, (dy * d) + moveToPoint.y)) {
                        elementsResult.push(element);
                        break;
                    }
                }
            }
        }
        return elementsResult;
    }
    getMeatChoppersAura() {
        const aura = this.meatChoppers.map(chopper => {
            return [new Point(chopper.getX() - 1, chopper.getY()),
            new Point(chopper.getX() + 1, chopper.getY()),
            new Point(chopper.getX(), chopper.getY() - 1),
            new Point(chopper.getX(), chopper.getY() + 1)
            ]
        })
        return [].concat(...aura)
    }

    getBarrierMatrix() {
        if (!this._barrierMatrix) {
            const matrix = (new Array(this.size)).fill(false)
                .map(() => (new Array(this.size)).fill(false));

            this.walls.forEach(wall => { matrix[wall.y][wall.x] = true });
            this.bombs.forEach(wall => { matrix[wall.y][wall.x] = true });
            this.meatChoppers.forEach(wall => { matrix[wall.y][wall.x] = true });
            this.destroyableWalls.forEach(wall => { matrix[wall.y][wall.x] = true });
            this._barrierMatrix = matrix;
        }
        return this._barrierMatrix;
    }

    rollAllDirections(fromPt, distance, cb) {
        const matrix = this.getBarrierMatrix();
        DirectionList.forEach(dir => {
            var currentPoint = fromPt
            for (var i = 0; i < distance; i++) {
                currentPoint = dir.nextPoint(currentPoint);
                if (!matrix[currentPoint.y][currentPoint.x]) {
                    cb(currentPoint, i);
                } else {
                    return;
                }
            }
        })
    }

    getScoresBoard() {
        if (!this._scoresBoard) {
            const bombPower = this.hero.bombsPower;
            const scoresBoard = (new Array(this.size)).fill(0).map(
                () => (new Array(this.size)).fill(0));

            this.destroyableWalls.forEach(wall => {
                scoresBoard[wall.y][wall.x] += settings.killWallScore;
                this.rollAllDirections(wall, bombPower, (pt) => {
                    scoresBoard[pt.y][pt.x] += settings.killWallScore;
                });
            });

            this.meatChoppers.forEach(wall => {
                scoresBoard[wall.y][wall.x] += settings.killMeatChopperScore;
                this.rollAllDirections(wall, bombPower, (pt, idx) => {
                    scoresBoard[pt.y][pt.x] += settings.killMeatChopperScore;
                });
            });

            this.players.forEach(player => {
                if (player.alive) {
                    const around = this.countElementsAroundPt(player, this.getBarriers()) || 1;
                    const killScore = settings.killOtherHeroScore + (this.players.length === 1 ? settings.winRoundScore : 0) / around;

                    scoresBoard[player.y][player.x] += killScore;
                    this.rollAllDirections(player, bombPower, (pt) => {
                        scoresBoard[pt.y][pt.x] += killScore;
                    });
                }
            });

            this.getUsefulPerks().forEach(perk => {
                scoresBoard[perk.y][perk.x] += settings.usePerkScore;
            });

            // negative scores
            // this.bombs.forEach(bomb => {
            //     const bombScore = settings.diePenalty + 8 - (bomb.timer * 2);
            //     scoresBoard[bomb.y][bomb.x] -= bombScore;
            //     this.rollAllDirections(bomb, bomb.power, (pt, i) => {
            //         scoresBoard[pt.y][pt.x] -= bombScore + bomb.power - i;
            //     });
            // });

            // this.meatChoppers.forEach(wall => {
            //     scoresBoard[wall.y][wall.x] -= settings.diePenalty;
            //     this.rollAllDirections(wall, 1, (pt, idx) => {
            //         scoresBoard[pt.y][pt.x] -= settings.diePenalty;
            //     });
            // });

            this._scoresBoard = scoresBoard;
        }
        return this._scoresBoard;
    }

    getBarriers(skipBlasts = false) {

        return [].concat(
            this.meatChoppers,
            // this.getMeatChoppersAura(),
            this.walls,
            this.destroyableWalls,
            this.players,
            skipBlasts ? [] : this.getFutureBlasts(2)
        );
    }
    toWalkMatrix() {
        if (!this._walkMatrix) {
            this._walkMatrix = (new Array(this.size)).fill(1).map(() => {
                return (new Array(this.size)).fill(1);
            });

            this.walls.forEach(bar => {
                this._walkMatrix[bar.y][bar.x] = 0;
            });

            const someWall = this.walls.concat(this.destroyableWalls);

            this.destroyableWalls.forEach(bar => {
                this._walkMatrix[bar.y][bar.x] = 8;
            });

            this.meatChoppers.forEach(ch => {
                this._walkMatrix[ch.y][ch.x] += 15;

                DirectionList.forEach(dir => {
                    const currentPoint = dir.nextPoint(ch);
                    if (!someWall.some(w => w.equals(currentPoint))) {
                        this._walkMatrix[currentPoint.y][currentPoint.x] += 20;
                    }
                })
            });

            this.bombs.forEach(bomb => {
                this._walkMatrix[bomb.y][bomb.x] = 25 + (5 - bomb.timer);

                DirectionList.forEach(dir => {
                    var currentPoint = dir.nextPoint(bomb);
                    var d = bomb.power;
                    for (var d = 1; d <= bomb.power; d++) {
                        if (someWall.some(w => w.equals(currentPoint))) {
                            this._walkMatrix[currentPoint.y][currentPoint.x] += 100 + (5 - bomb.timer) - d;
                            break;
                        } else {
                            this._walkMatrix[currentPoint.y][currentPoint.x] += 25 + (5 - bomb.timer) - d;
                            currentPoint = dir.nextPoint(currentPoint);
                        }
                    }

                })
            });
        }

        return this._walkMatrix;
    }

    getFutureBlasts(time = 1) {
        var bombs = this.bombs;
        var result = [];
        for (var index in bombs) {
            var bomb = bombs[index];
            result.push(bomb);

            var aroundIdx = around.length;

            if (bomb.timer <= time) {
                while (aroundIdx--) {
                    var [dx, dy] = around[aroundIdx];
                    for (var d = 1; d <= bomb.power; d++) {
                        var point = new Point((dx * d) + bomb.x, (dy * d) + bomb.y);
                        if (this.walls.some(w => w.equals(point))) {
                            break;
                        } else if (this.destroyableWalls.some(w => w.equals(point))) {
                            break;
                        } else if (this.players.some(w => w.equals(point))) {
                            break;
                        } else if (this.hero.equals(point)) {
                            result.push(point);
                            break;
                        } else {
                            result.push(point);
                        }
                    }
                }
            }
        }
        var result2 = [];
        for (var index in result) {
            var blast = result[index];
            if (blast.isOutOf(this.size) || contains(this.walls, blast)) {
                continue;
            }
            result2.push(blast);
        }
        return result2;
    };
    constructor(/** @type {GameState}  */gameState, oldBoard) {
        if (oldBoard) {
            this.size = oldBoard.size;
            this.rows = oldBoard.rows;
        } else {
            this.size = gameState.size;
            this.walls = gameState.walls.map(wl => new Point(wl.x, wl.y));
            this.destroyableWalls = gameState.destroyableWalls.map(wl => new Point(wl.x, wl.y));
            this.bombs = gameState.bombs.map(bomb => new Bomb(bomb.owner, bomb.x, bomb.y, bomb.power, bomb.timer));
            this.meatChoppers = gameState.meatChoppers.map(ch => new Point(ch.x, ch.y));

            this.hero = new Player(
                gameState.hero.x,
                gameState.hero.y,
                gameState.hero.bombsCount,
                gameState.hero.bombsPower,
            )
            this.players = gameState.players.map(pl => new Player(
                pl.x,
                pl.y,
                pl.bombsCount,
                pl.bombsPower
            ));

            this.perks = {};
            Object.keys(gameState.perks).forEach(perkType => {
                this.perks[perkType] = gameState.perks[perkType].map(wl => new Point(wl.x, wl.y))
            })
        }
    }
    /**
     * @returns {Player}
     */
    getHero() {
        return this.hero;
    }
    getBombs() {
        return this.bombs;
    }
    nextTick() {
        const newBoard = new Board(null, this);

        newBoard.removeBlasts();
        newBoard.tactAllBombermans();
        // meatChopperEatBombermans();

        newBoard.tactAllBombs();

        return newBoard;

    }
    getUsefulPerks() {
        return this.perks[Element.BOMB_BLAST_RADIUS_INCREASE]
            .concat(
                this.perks[Element.BOMB_COUNT_INCREASE],
                this.perks[Element.BOMB_IMMUNE]
            )
    }
    removeBlasts() {
        var rowsIdx = this.rows.length;
        while (rowsIdx--) {
            var blastIndex = this.rows[rowsIdx].indexOf(Element.BOOM);

            while (blastIndex > -1) {
                this.rows[rowsIdx] = setCharAt(this.rows[rowsIdx], blastIndex, Element.NONE)
            }
        }

        // remove walls
        rowsIdx = this.rows.length;
        while (rowsIdx--) {
            var blastIndex = this.rows[rowsIdx].indexOf(Element.DESTROYED_WALL);

            while (blastIndex > -1) {
                this.rows[rowsIdx] = setCharAt(this.rows[rowsIdx], blastIndex, Element.NONE)
            }
        }
    }

    tactAllBombermans() {
        // const bombermans = this.getActiveActors().filter(bomber => isBomber(bomber.getType()))
    }
    tactAllBombs() {
        const bombs = this.getBombs();
        var idx = bombs.length;
        while (idx--) {
            var bomb = bombs[idx];
            bomb.tick();
        }
    }

    // handleExplode(bx, by) {
    //     var elUnder = this.getElementAt(bx, by);

    //     if (elUnder === Element.NONE) {
    //         this.rows[by] = setCharAt(this.rows[by], bx, Element.BOOM);
    //     } else if (elUnder === Element.DESTROYABLE_WALL) {
    //         this.rows[by] = setCharAt(this.rows[by], bx, Element.DESTROYED_WALL);
    //         return true;
    //     } else if (elUnder === Element.MEAT_CHOPPER) {
    //         this.rows[by] = setCharAt(this.rows[by], bx, Element.DEAD_MEAT_CHOPPER);
    //     } else if (elUnder === Element.BOMB_BOMBERMAN || elUnder === Element.BOMBERMAN) {
    //         this.rows[by] = setCharAt(this.rows[by], bx, Element.DEAD_BOMBERMAN);
    //     } else if (elUnder === Element.OTHER_BOMBERMAN || Element.OTHER_BOMB_BOMBERMAN) {
    //         this.rows[by] = setCharAt(this.rows[by], bx, Element.OTHER_DEAD_BOMBERMAN);
    //     } else {
    //         return true;
    //     }
    // }
}

exports.Board = Board;
