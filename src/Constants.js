const Point = require("./Point");

var Element = {
    /// This is your Bomberman
    BOMBERMAN: '☺',
    BOMB_BOMBERMAN: '☻',
    DEAD_BOMBERMAN: 'Ѡ',



    // you're getting -200 for each death
    /// this is other players Bombermans
    OTHER_BOMBERMAN: '♥',
    OTHER_BOMB_BOMBERMAN: '♠',
    OTHER_DEAD_BOMBERMAN: '♣',



    // if you've done it you'll get +1000
    /// the bombs
    BOMB_TIMER_5: '5',
    BOMB_TIMER_4: '4',
    BOMB_TIMER_3: '3',
    BOMB_TIMER_2: '2',
    BOMB_TIMER_1: '1',
    BOOM: '҉',


    /// walls
    WALL: '☼',
    DESTROYABLE_WALL: '#',
    DESTROYED_WALL: 'H',



    // if it's you did it - you'll get +10 points.
    /// meatchoppers
    MEAT_CHOPPER: '&',


    // if it will touch bomberman - it will die
    // you'd better kill this piece of ... meat, you'll get +100 point for it
    DEAD_MEAT_CHOPPER: 'x',


    /// perks
    BOMB_BLAST_RADIUS_INCREASE: '+',
    BOMB_COUNT_INCREASE: 'c',
    BOMB_REMOTE_CONTROL: 'r',
    BOMB_IMMUNE: 'i',

    /// a void
    NONE: ' ' // this is the only place where you can move your Bomberman
};
exports.Element = Element;

exports.bonuses = {
    MEAT_CHOPPER: 3,
    WALL: 1,
    OTHER_BOMBERMAN: 10,
    SELF: -2
}

const bombers = [
    Element.BOMB_BOMBERMAN,
    Element.BOMBERMAN
]
exports.isBomber = (char) => bombers.includes(char);

const otherBombers = [
    Element.BOMB_BOMBERMAN,
    Element.BOMBERMAN,
    Element.OTHER_BOMB_BOMBERMAN,
    Element.OTHER_BOMBERMAN
]
exports.isOtherBomber = (char) => otherBombers.includes(char);

exports.settings = {
    'boardSize': 23,
    'bombPower': 3,
    'bombsCount': 1,
    'destroyWallCount': 52,
    'diePenalty': 2,
    'isMultiple': true,
    'killMeatChopperScore': 3,
    'killOtherHeroScore': 10,
    'killWallScore': 1,
    'meatChoppersCount': 5,
    'perkBombBlastRadiusInc': 2,
    'perkBombCountInc': 3,
    'perkDropRatio': 20,
    'perkPickTimeout': 5,
    'playersPerRoom': 5,
    'remoteControlCount': 3,
    'roundSettings': {
        'minTicksForWin': 1,
        'roundsEnabled': false,
        'roundsPerMatch': 1,
        'timeBeforeStart': 5,
        'timeForWinner': 1,
        'timePerRound': 300
    },
    'timeoutBombBlastRadiusInc': 10,
    'timeoutBombCountInc': 10,
    'timeoutBombImmune': 10,
    'winRoundScore': 15
}

const bombs = [
    Element.BOMB_TIMER_1,
    Element.BOMB_TIMER_2,
    Element.BOMB_TIMER_3,
    Element.BOMB_TIMER_4,
    Element.BOMB_TIMER_5
];

exports.isBomb = (char) => bombs.includes(char);

class Dir {
    constructor(index, dx, dy, name) {
        this.index = index;
        this.dx = dx;
        this.dy = dy;
        this.name = name;
    }
    nextPoint(pt) {
        return new Point(pt.x + this.dx, pt.y + this.dy);
    }
    changeX(x) {
        return x + this.dx;
    }

    changeY(y) {
        return y - this.dy;
    }

    //     inverted () {
    //     switch (this) {
    //         case Direction.UP: return Direction.DOWN;
    //         case Direction.DOWN: return Direction.UP;
    //         case Direction.LEFT: return Direction.RIGHT;
    //         case Direction.RIGHT: return Direction.LEFT;
    //         default: return Direction.STOP;
    //     }
    // };

    toString = function () {
        return this.name;
    }

    getIndex() {
        return this.index;
    }
}

const Direction = {
    UP: new Dir(2, 0, -1, 'UP'),                 // you can move
    DOWN: new Dir(3, 0, 1, 'DOWN'),
    LEFT: new Dir(0, -1, 0, 'LEFT'),
    RIGHT: new Dir(1, 1, 0, 'RIGHT'),
    ACT: new Dir(4, 0, 0, 'ACT'),                // drop bomb
    STOP: new Dir(5, 0, 0, 'STOP')                   // stay
};

exports.getCommandByCoord = function (x, y, x2, y2) {
    if (x < x2) {
        return Direction.RIGHT;
    } else if (x > x2) {
        return Direction.LEFT;
    } else if (y > y2) {
        return Direction.UP;
    } else {
        return Direction.DOWN;
    }
}

exports.Direction = Direction;

const nonWalkableElements = [
    Element.WALL,
    Element.DESTROYABLE_WALL,
    Element.OTHER_BOMBERMAN,
    Element.OTHER_BOMB_BOMBERMAN,
    Element.MEAT_CHOPPER,
    Element.BOMB_TIMER_1,
    Element.BOMB_TIMER_2,
    Element.BOMB_TIMER_3,
    Element.BOMB_TIMER_4,
    Element.BOMB_TIMER_5
]

/**
 *
 * @param {string} el
 */
exports.isWalkableElement = function (el) {
    return !nonWalkableElements.includes(el);
}
