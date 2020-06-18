
const { Element, isBomber } = require('./Constants');
const Actor = require('./Actor');
const Point = require('./Point');

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

class Board {
    constructor(/** @type {string}  */board, oldBoard) {
        if (oldBoard) {
            this.size = oldBoard.size;
            this.rows = oldBoard.rows;
        } else {
            this.size = Math.sqrt(board.length);
            this.rows = new Array(this.size);

            for (var i = 0; i < this.size; i++) {
                this.rows[i] = board.substring(i * this.size, (i + 1) * this.size);
            }
        }
    }
    /**
     * @returns {Actor[]}
     */
    getActiveActors() {
        if (!this._actors) {
            const res = [];

            var rowsIdx = this.rows.length;
            while (rowsIdx--) {
                var row = this.rows[rowsIdx];
                var rowLength = row.length;

                while (rowLength--) {
                    if (activeActors.includes(row[rowLength])) {
                        res.push(new Actor(row[rowLength], rowLength, rowsIdx, this))
                    }
                }
            }

            this._actors = res;
        }

        return this._actors;
    }
    getElementAt(x, y) {
        return this.rows[y][x];
    }
    getElementAtPt(pt) {
        return this.rows[pt.y][pt.x];
    }
    getHero() {
        return this.getActiveActors().filter(
            actor => actor.getType() === Element.BOMBERMAN || actor.getType() === Element.BOMB_BOMBERMAN
        )[0];
    }
    getBombs() {
        if (!this._bombs) {
            const res = [];

            var rowsIdx = this.rows.length;
            while (rowsIdx--) {
                var row = this.rows[rowsIdx];
                var rowLength = row.length;

                while (rowLength--) {
                    if ('12345'.includes(row[rowLength])) {
                        res.push(new Point(rowLength, rowsIdx))
                    }
                }
            }

            this._bombs = res;
        }

        return this._bombs;
    }
    nextTick() {
        let heroScore = 0;
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
        const bombermans = this.getActiveActors().filter(bomber => isBomber(bomber.getType()))
    }
    tactAllBombs(bombPower = 3) {
        const bombs = this.getBombs();
        var idx = bombs.length;
        while (idx--) {
            var bomb = bombs[idx];
            var i;

            var bombType = this.getElementAt(bomb);
            if ('2345'.includes(bombType)) {
                this.rows[bomb.y] = setCharAt(this.rows[bomb.y], bomb.x, bombType - 1);
            } else {
                this.rows[bomb.y] = setCharAt(this.rows[bomb.y], bomb.x, Element.BOOM);

                // right
                for (i = 1; i <= bombPower; i++) {
                    if (this.handleExplode(bomb, i)) {
                        break;
                    };
                }
                // left
                for (i = 1; i <= bombPower; i++) {
                    if(this.handleExplode( bomb.x - i, bomb.y)) {
                        break;
                    };
                }
                // up
                for (i = 1; i <= bombPower; i++) {
                    if (this.handleExplode( bomb.x, bomb.y + i)) {
                        break;
                    };
                }
                // down
                for (i = 1; i <= bombPower; i++) {
                    if (this.handleExplode( bomb.x, bomb.y - i)) {
                        break;
                    };
                }
            }
        }
    }

    handleExplode(bx, by) {
        var elUnder = this.getElementAt(bx, by);

        if (elUnder === Element.NONE) {
            this.rows[by] = setCharAt(this.rows[by], bx, Element.BOOM);
        } else if (elUnder === Element.DESTROYABLE_WALL) {
            this.rows[by] = setCharAt(this.rows[by], bx, Element.DESTROYED_WALL);
            return true;
        } else if (elUnder === Element.MEAT_CHOPPER) {
            this.rows[by] = setCharAt(this.rows[by], bx, Element.DEAD_MEAT_CHOPPER);
        } else if (elUnder === Element.BOMB_BOMBERMAN || elUnder === Element.BOMBERMAN) {
            this.rows[by] = setCharAt(this.rows[by], bx, Element.DEAD_BOMBERMAN);
        } else if (elUnder === Element.OTHER_BOMBERMAN || Element.OTHER_BOMB_BOMBERMAN) {
            this.rows[by] = setCharAt(this.rows[by], bx, Element.OTHER_DEAD_BOMBERMAN);
        } else {
            return true;
        }
    }
}

exports.Board = Board;
