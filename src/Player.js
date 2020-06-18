const Point = require("./Point");
const { isWalkableElement } = require("./Constants");

class Player extends Point {
    constructor(x, y, bombsCount = 1, bombsPower = 3) {
        super(x, y);
        this.bombsCount = bombsCount;
        this.bombsPower = bombsPower;
        this.alive = true;
        this.immune = 0;
    }
    setDirection(direction) {
        this.direction = direction;
    }
    equals(o) {
        return this === o || (this.alive && o.x === this.x && o.y === this.y);
    }
    equalsTo(x, y) {
        return this.alive && x === this.x && y === this.y;
    }
}

module.exports = Player;
