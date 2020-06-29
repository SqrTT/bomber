const Point = require("./Point");
const { isWalkableElement } = require("./Constants");

class Player extends Point {
    constructor(x, y, bombsCount = 1, bombsPower = 3, alive = true) {
        super(x, y);
        this.bombsCountTime = 0;
        this.bombsCount = bombsCount;
        this.bombsPower = bombsPower;
        this.bombsPowerTime = 0;
        this.alive = alive;
        this.immuneTime = 0;
        this.rcBombCount = 0;
        this.afk = false;
    }
    equals(o) {
        return (this.alive && o.x === this.x && o.y === this.y);
    }
    equalsTo(x, y) {
        return this.alive && x === this.x && y === this.y;
    }
}

module.exports = Player;
