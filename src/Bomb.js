const Point = require("./Point");
const { Element } = require("./Constants");

class Bomb extends Point {
    constructor(owner, x, y, power = 3, timer = 5) {
        super(x, y);
        this.owner = owner;
        this.timer = timer;
        this.power = power;
    }

    tick() {
        this.timer--;
        if (this.timer === 0) {
            this.boom();
        }
    }

    boom() {
        //this.field.removeBomb(this);
    }

    getTimer() {
        return this.timer;
    }

    getPower() {
        return this.power;
    }

    isExploded() {
        return this.timer === 0;
    }

    itsMine(owner) {
        return this.owner === owner;
    }

    getOwner() {
        return this.owner;
    }

    state() {
        switch (this.timer) {
            case 1: return Element.BOMB_TIMER_1;
            case 2: return Element.BOMB_TIMER_2;
            case 3: return Element.BOMB_TIMER_3;
            case 4: return Element.BOMB_TIMER_4;
            case 5: return Element.BOMB_TIMER_5;
            default: return Element.BOOM;
        }
    }
}

module.exports = Bomb;
