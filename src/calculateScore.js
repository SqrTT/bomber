const { Board } = require("./Board");
const { Direction, Element } = require("./Constants");
const Point = require("./Point");

//
function random(n) {
    return Math.floor(Math.random() * n);
};


exports.calc = function (data) {
    const board = new Board(data.gameState);

    const nextMove = Direction[data.action];
    const hero = board.getHero();

    const moveToPoint = Point.pt(
        nextMove.changeX(hero.getX()),
        nextMove.changeY(hero.getY())
    )

    var scoreForPos = 0;

    if (board.players.some(pl => pl.equals(moveToPoint))) {
        scoreForPos -= 10;
    }

    var choppers = board.countElementsAroundPt(moveToPoint, board.meatChoppers);
    if (choppers > 0) {
        scoreForPos -= choppers * 20;
    }

    var walls = board.countElementsAroundPt(moveToPoint, board.destroyableWalls);
    if (walls > 0) {
        scoreForPos += walls * 2;
    }

    var exits = 4 - board.countElementsAroundPt(moveToPoint, board.getBarriers());
    if (exits > 0) {
        scoreForPos += exits * 2;
    } else {
        scoreForPos -= 2;
    }

    // var bomb1 = board.countElementsAround(nextX, nextY, Element.BOMB_TIMER_1, 5);
    // if (bomb1 > 0) {
    //     scoreForPos -= bomb1 * 50;
    // }
    // var bomb2 = board.countElementsAround(nextX, nextY, Element.BOMB_TIMER_2, 5);
    // if (bomb2 > 0) {
    //     scoreForPos -= bomb2 * 40;
    // }
    // var bomb3 = board.countElementsAround(nextX, nextY, Element.BOMB_TIMER_3, 5);
    // if (bomb3 > 0) {
    //     scoreForPos -= bomb3 * 30;
    // }

    // var bomb4 = board.countElementsAround(nextX, nextY, Element.BOMB_TIMER_4, 5);
    // if (bomb4 > 0) {
    //     scoreForPos -= bomb4 * 20;
    // }
    // var bomb5 = board.countElementsAround(nextX, nextY, Element.BOMB_TIMER_5, 5);
    // if (bomb5 > 0) {
    //     scoreForPos -= bomb5 * 10;
    // }

    // var bomber = board.countElementsAround(nextX, nextY, Element.BOMB_BOMBERMAN, 4, 2);
    // if (bomber > 0) {
    //     scoreForPos -= bomber * 10;
    // }

    // var otherbomber = board.countElementsAround(nextX, nextY, Element.OTHER_BOMB_BOMBERMAN, 4);
    // if (otherbomber > 0) {
    //     scoreForPos -= otherbomber * 10;
    // }

    if (
        hero.bombsCount > 0
        && (walls
            || board.countElementsAroundPt(nextMove, board.meatChoppers, 2)
            || board.countElementsAroundPt(nextMove, board.players, 2)
            || random(5) > 2
            )
        ) {
        data.action += ',ACT';
    }

    return scoreForPos;
}
