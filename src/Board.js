
const { Element, isBomber, isWalkableElement, settings, DirectionList, range } = require('./Constants');
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

/**
 * @template T
 * @param {T} a
 */
function copyAsIs(a) {
    return a;
}

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

    /**
     *
     * @param {Point} bomb_point
     * @param {number} blast
     * @param {boolean} br
     */
    *blasts(bomb_point, blast = 4, br = true) {
        for (const [search_range, is_x] of [
            [range(bomb_point.x, bomb_point.x + blast), true],
            [range(bomb_point.x, bomb_point.x - blast, -1), true],
            [range(bomb_point.y, bomb_point.y + blast), false],
            [range(bomb_point.y, bomb_point.y - blast, -1), false]
        ]) {

            for (const i of search_range) {
                const [x, y] = is_x ? [i, bomb_point.y] : [bomb_point.x, i];
                const el = this.getAt(x, y);

                if (el === Element.WALL) {
                    break
                } else {

                    if (x < 0 || y < 0) {
                        debugger;
                    }
                    yield new Point(x, y);
                    if (el == Element.DESTROYABLE_WALL && !(bomb_point.x === x && bomb_point.y === y)) {
                        break
                    }
                    if ([Element.MEAT_CHOPPER, Element.OTHER_BOMBERMAN].includes(el) && (bomb_point.x != x || bomb_point.y != y) && br) {
                        break
                    }
                }
            }

        }
    }

    nextHeroBombAvailable() {
        const heroBomb = this.bombs.filter(b => b.owner === -1);

        if (heroBomb.length === 0 || heroBomb.length > 1) {
            return 0;
        }
        if (heroBomb.some(b => b.rc)) {
            return 1;
        }
        return heroBomb.pop().timer + 1;
    }


    canSurvive(x, y, t, score) {
        // """can I survive if I place bomb at (x, y) and time t"""
        const [dist] = this.bfs(x, y, t, [new Bomb(-1, x, y)])
        for (const i of range(0, this.size )) {
            for (const j of range(0, this.size)) {
                if (score[i][j] >= 0 && dist[i][j][6] < 100) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *
     * @param {number} startX
     * @param {number} startY
     * @param {number} startTime
     * @param {Bomb[]} additional_bombs
     */
    bfs(startX, startY, startTime = 0, additional_bombs = []) {
        // """shortest paths to each cell from (sx, sy) and time st"""
        const n = this.size;
        const self = this;

        // dist = [[[1e9 for k in range(7)] for j in range(n)] for i in range(n)]
        // par = [[[None for k in range(7)] for j in range(n)] for i in range(n)]
        // penalty = [[[0 for k in range(7)] for j in range(n)] for i in range(n)]



        const penalty = (new Array(this.size)).fill(0).map(
            () => (new Array(this.size)).fill(0).map(() => new Array(7).fill(0)));

        // # penalty for stepping on cells with different objects
        for (const i of range(0, n)) {
            for (const j of range(0, n)) {
                const el = this.getAt(i, j);

                if ([Element.WALL, Element.DESTROYABLE_WALL].includes(el)) {
                    for (const k of range(0, 7)) {
                        penalty[j][i][k] += 1e10;
                    }
                }
                const bombAtEl = this.bombs.find(b => b.equalsTo(i, j));
                if (bombAtEl) {
                    const t = bombAtEl.rc ? 6 : Math.max(bombAtEl.timer - startTime, 0)
                    for (const k of range(0, t + 1)) {
                        penalty[j][i][k] += 1e10
                    }

                    //const [t, r] = self.get_bomb_info(i, j)
                    const radius = bombAtEl.power + 1;

                    const ps = this.blasts(new Point(j, i), radius)
                    for (const p of ps) {
                        if (bombAtEl.rc) {
                            if (!self.bombs.some(b => b.equalsTo(i, j))) {
                                for (const k of range(0, 7)) {
                                    penalty[p.y][p.x][k] += 1e4
                                }
                            }
                        } else {
                            if (bombAtEl.timer - startTime < 0) {
                                continue
                            }
                            penalty[p.y][p.x][bombAtEl.timer - startTime] += 1e10
                        }
                    }
                    continue;
                }

                if (el == Element.OTHER_BOMBERMAN && Math.abs(i - startX) + Math.abs(j - startY) < 10) {
                    for (const k of range(0, 7)) {
                        if (k == 1 && startTime == 0) {
                            penalty[j][i][k] += 1e5
                        } else {
                            penalty[j][i][k] += 1e3

                        }
                    }
                    continue;
                }

                if (el == Element.MEAT_CHOPPER && Math.abs(i - startX) + Math.abs(j - startY) < 10) {
                    for (const k of range(0, 7)) {
                        if (k == 1 && startTime == 0) {
                            penalty[j][i][k] += 1e10
                        } else {
                            penalty[j][i][k] += 1e6 + (7 - k) * 1e5
                            penalty[j - 1][i][k] += 1e6 + (7 - k) * 1e5
                            penalty[j + 1][i][k] += 1e6 + (7 - k) * 1e5
                            penalty[j][i - 1][k] += 1e6 + (7 - k) * 1e5
                            penalty[j][i + 1][k] += 1e6 + (7 - k) * 1e5
                        }
                    }
                }
            }
        }


        for (const bomb of additional_bombs) {
            const t = Math.min(6, 4 + bomb.timer - startTime)
            if (t < 0) {
                continue
            }
            const ps = this.blasts(new Point(bomb.x, bomb.y), bomb.power + 1, false)
            for (const p of ps) {
                penalty[p.y][p.x][t] += 1e10
            }
        }

        const par = (new Array(this.size)).fill(0).map(
            () => (new Array(this.size)).fill(0).map(() => new Array(7).fill(null)));

        const dist = (new Array(this.size)).fill(0).map(
            () => (new Array(this.size)).fill(0).map(() => new Array(7).fill(1e9)));

        dist[startY][startX][0] = 0
        const Q = [[startY, startX, 0]];
        let L = 0
        const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1], [0, 0]];
        while (L < Q.length) {
            const [y, x, t] = Q[L];
            // assert(dist[x][y][t] >= 0);
            L += 1;
            for (const dir of dirs) {
                const xx = x + dir[0]
                const yy = y + dir[1]
                const tt = Math.min(t + 1, 6);

                if ((yy >= 0 && yy < this.size && xx >= 0 && xx < this.size)
                    && dist[yy][xx][tt] > dist[y][x][t] + 1 + penalty[yy][xx][tt]
                ) {
                    dist[yy][xx][tt] = dist[y][x][t] + 1 + penalty[yy][xx][tt]
                    par[yy][xx][tt] = [y, x, t]
                    Q.push([yy, xx, tt])
                }
            }
        }

        return [dist, par]
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

    /**
     *
     * @param {Point} pos
     */
    canKillPerk(pos) {
        // """does bomb at (x, y) kill any perk"""
        const ps = this.blasts(pos, this.hero.bombsPower + 1);
        for (const p of ps) {
            if (p.equals(pos)) {
                continue
            }
            return this.getUsefulPerks().some(perk => perk.equals(pos));
        }
        return false
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

    // rollAllDirections(fromPt, distance, cb) {
    //     const matrix = this.getBarrierMatrix();

    //     for (const dir of DirectionList) {
    //         var currentPoint = fromPt
    //         for (const point of range(0, distance)) {
    //             currentPoint = dir.nextPoint(currentPoint);
    //             if (!matrix[currentPoint.y][currentPoint.x]) {
    //                 cb(currentPoint, point);
    //             } else {
    //                 return;
    //             }
    //         }
    //     }
    // }

    canGo(pt) {
        return [Element.BOMBERMAN, Element.NONE].includes(this.getAt(pt.x, pt.y));
    }

    getScoresBoard() {
        if (!this._scoresBoard) {
            const score = (new Array(this.size)).fill(0).map(
                () => (new Array(this.size)).fill(0));

            this.bombs.forEach(bomb => {
                const ps = this.blasts(bomb, bomb.power + 1, false)
                for (const p of ps) {
                    score[p.y][p.x] = -1e9
                }
            });

            this.getUsefulPerks().forEach(perk => {
                if (score[perk.y][perk.x] > -1e8) {
                    score[perk.y][perk.x] += 5;
                }
            })

            this.destroyableWalls.forEach(wall => {
                if (score[wall.y][wall.x] > -1e8) {
                    const ps = this.blasts(wall, this.hero.bombsPower + 1, true);
                    for (const p of ps) {
                        if (this.canGo(p)) {
                            score[p.y][p.x] += 1;
                        }
                    }
                }
            })

            this.players.filter(p => p.alive && p.afk).forEach(player => {
                if (score[player.y][player.x] > -1e8) {
                    const ps = this.blasts(player, this.hero.bombsPower);
                    for (const p of ps) {
                        if (this.canGo(player)) {
                            score[p.y][p.x] += 20
                        }
                    }
                }
            })

            for (const wall of this.walls) {
                score[wall.y][wall.x] = -1e9
            }
            for (const wall of this.destroyableWalls) {
                score[wall.y][wall.x] = -1e9
            }
            for (const ch of this.meatChoppers) {
                score[ch.y][ch.x] = -1e9
                score[ch.y - 1][ch.x] = -1e9
                score[ch.y + 1][ch.x] = -1e9
                score[ch.y][ch.x - 1] = -1e9
                score[ch.y][ch.x + 1] = -1e9
            }


            this._scoresBoard = score;
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
    /**
     *
     * @param {Point} pt
     */
    nearHero(pt) {
        return Math.sqrt(((pt.x - this.hero.x) ** 2) + ((pt.y - this.hero.y) ** 2)) <= 2;
    }
    toWalkMatrix(step = 0) {
        if (!this._walkMatrix.has(step)) {
            const walkMatrix = (new Array(this.size)).fill(1).map(() => {
                return (new Array(this.size)).fill(1);
            });

            for (const bar of this.walls) {
                walkMatrix[bar.y][bar.x] = 0;
            };

            const someWall = this.walls.concat(this.destroyableWalls);

            for (const bar of this.destroyableWalls) {
                walkMatrix[bar.y][bar.x] = 8;
            };

            for (const ch of this.meatChoppers) {
                walkMatrix[ch.y][ch.x] = this.nearHero(ch) ? 0 : 20;

                for (const dir of DirectionList) {
                    const currentPoint = dir.nextPoint(ch);
                    if (!someWall.some(w => w.equals(currentPoint))) {
                        walkMatrix[currentPoint.y][currentPoint.x] = this.nearHero(ch) ? 0 : 6;
                    }
                }
            };

            for (const player of this.players) {
                walkMatrix[player.y][player.x] = 100;
            };

            for (const bomb of this.bombs) {
                const bombTime = bomb.timer === 5 ? 5 : Math.max(bomb.timer - step, 0);

                if (bombTime) {
                    walkMatrix[bomb.y][bomb.x] = 0;

                    if ((this.hero.immuneTime - step) < 4) {
                        for (const dir of DirectionList) {
                            var currentPoint = dir.nextPoint(bomb);

                            for (var d = 1; d <= bomb.power; d++) {
                                if (
                                    someWall.some(w => w.equals(currentPoint)) ||
                                    this.players.some(b => b.equals(currentPoint)) ||
                                    this.meatChoppers.some(b => b.equals(currentPoint))
                                ) {
                                    walkMatrix[currentPoint.y][currentPoint.x] = 0;
                                    break;
                                } else if (bombTime === 1) {
                                    walkMatrix[currentPoint.y][currentPoint.x] = 0;
                                }
                                for (const dirIn of DirectionList) {
                                    const wall = dirIn.nextPoint(currentPoint);
                                    if (
                                        this.destroyableWalls.some(w => w.equals(wall)) ||
                                        this.players.some(b => b.equals(wall))
                                    ) {
                                        walkMatrix[wall.y][wall.x] = 0;
                                    }
                                }
                                currentPoint = dir.nextPoint(currentPoint);
                            }
                        }
                    }
                }
            };
            walkMatrix[this.hero.y][this.hero.x] = 1;
            this._walkMatrix.set(step, walkMatrix);
        }

        return this._walkMatrix.get(step);
    }

    getFutureBlasts(time = 1) {
        var bombs = this.bombs;
        var result = [];
        for (const bomb of bombs) {
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

    getBoardPos(x, y) {
        return y * this.size + x;
    }

    /**
     *
     * @param {number} x
     * @param {number} y
     */
    getAt(x, y) {
        return this.board.charAt(this.getBoardPos(x, y));
    };

    constructor(/** @type {GameState}  */gameState, oldBoard) {
        if (oldBoard) {
            this.size = oldBoard.size;
            this.rows = oldBoard.rows;
        } else {
            /**
             * @type {string}
             */
            this.board = gameState.board;
            ///this.gameState = gameState;
            this._walkMatrix = new Map();
            this.size = gameState.size;
            this.walls = gameState.walls.map(copyAsIs);
            this.destroyableWalls = gameState.destroyableWalls.map(copyAsIs);
            this.bombs = gameState.bombs.map(copyAsIs);
            this.meatChoppers = gameState.meatChoppers.map(copyAsIs);

            this.hero = gameState.hero;

            this.players = gameState.players.filter(p => p.alive).map(copyAsIs);

            this.perks = {};
            Object.keys(gameState.perks).forEach(perkType => {
                this.perks[perkType] = gameState.perks[perkType].map(copyAsIs)
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

    /**
     * @returns {Point[]}
     */
    getUsefulPerks() {
        return this.perks[Element.BOMB_BLAST_RADIUS_INCREASE]
            .concat(
                this.perks[Element.BOMB_COUNT_INCREASE],
                this.perks[Element.BOMB_IMMUNE],
                this.perks[Element.BOMB_REMOTE_CONTROL]
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
