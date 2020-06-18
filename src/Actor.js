const Point = require("./Point");
const { isWalkableElement } = require("./Constants");

class Actor extends Point {
    constructor(type, x, y, board) {
        super(x, y);
        this.type = type;
        this.board = board;
    }
    getType() {
        return this.type;
    }
    canMoveUP() {
        return isWalkableElement(this.board.getElementAt(this.x, this.y - 1));
    }
    canMoveDOWN() {
        return isWalkableElement(this.board.getElementAt(this.x, this.y + 1));
    }
    canMoveLEFT() {
        return isWalkableElement(this.board.getElementAt(this.x - 1, this.y));
    }
    canMoveRIGHT() {
        return isWalkableElement(this.board.getElementAt(this.x + 1, this.y));
    }
    setDirection(direction) {
        this.direction = direction;
    }
}

module.exports = Actor;
