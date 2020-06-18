
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(o) {
        return o.getX() == this.x && o.getY() == this.y;
    }

    toString() {
        return '[' + this.x + ',' + this.y + ']';
    }

    isOutOf(boardSize) {
        return this.x >= boardSize || this.y >= boardSize || this.x < 0 || this.y < 0;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }
};

Point.pt = function (x, y) {
    return new Point(x, y);
};

module.exports = Point;
