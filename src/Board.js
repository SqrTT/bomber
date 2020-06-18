
const { Element, isBomber, isWalkableElement } = require('./Constants');
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

var contains  = function(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i].equals(obj)) {
           return true;
       }
    }
    return false;
};

var removeDuplicates = function(all) {
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
    countElementsAroundPt(moveToPoint, elements) {
        var count = 0;
        var idx = elements.length;

        while (idx--) {
            var element = elements[idx];
            var aroundIdx = around.length;

            while (aroundIdx--) {
                var [dx, dy] = around[aroundIdx];
                if (element.equalsTo(dx + moveToPoint.x, dy + moveToPoint.y )) {
                    count++;
                }
            }
        }
        return count;
    }

    getBarriers() {
        return [].concat(
            this.meatChoppers,
            this.walls,
            this.destroyableWalls,
            this.players,
            this.getFutureBlasts()
        );
    }

    getFutureBlasts() {
        var bombs = this.bombs;
        var result = [];
        for (var index in bombs) {
            var bomb = bombs[index];
            result.push(bomb);
            result.push(new Point(bomb.getX() - 1, bomb.getY())); // TODO to remove duplicate
            result.push(new Point(bomb.getX() + 1, bomb.getY()));
            result.push(new Point(bomb.getX()    , bomb.getY() - 1));
            result.push(new Point(bomb.getX()    , bomb.getY() + 1));
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
