const { Board } = require("./Board");
const { Direction, Element, getCommandByCoord } = require("./Constants");
const Point = require("./Point");
const PF = require('pathfinding');


function getPaths(board, fromPT, toPt) {
    const grid = new PF.Grid(board.toWalkMatrix());
    grid.setWalkableAt(toPt.x, toPt.y, true);
    const finder = new PF.AStarFinder();
    var path = finder.findPath(fromPT.x, fromPT.y, toPt.x, toPt.y, grid);
    return path;
}

exports.getPaths = getPaths;

function hasExit(board, pos) {
    return 1 < board.countElementsAroundPt(pos, board.getBarriers());
}

exports.calc = function (data) {
    const board = new Board(data.gameState);

    const hero = board.getHero();

    const wallsAround = board.countElementsAroundPt(hero, board.walls.concat(board.destroyableWalls));
    if (wallsAround === 4) {
        5
        return 'ACT';
    }

    const barriers = board.countElementsAroundPt(hero, board.getBarriers());
    if (barriers === 4) {
        return 'STOP';
    }

    const isOnBlast = board.getFutureBlasts(3).some(bl => hero.equals(bl));

    if (isOnBlast) {
        const nonFrePlaces = board.getElementsAroundPt(hero, board.getBarriers());
        const nextStep = ['UP', 'DOWN', 'LEFT', 'RIGHT'].filter(dir => {
            const next = Direction[dir].nextPoint(hero);
            return nonFrePlaces.every(place => !place.equals(next))
        }); hasExit
        return nextStep.find(dir => hasExit(board, Direction[dir].nextPoint(hero))) || nextStep[0]
    }

    /// step
    const choppersDistance = board.meatChoppers.map(ch => ({
        ch: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1]).sort((a, b) => {
        return a.path.length - b.path.length;
    });

    const playerDistance = board.players.map(ch => ({
        player: ch,
        path: ch.alive && getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1])
        .sort((a, b) => {
            return a.path.length - b.path.length;
        });

    const perkDistance = board.getUsefulPerks().map(ch => ({
        ch: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1])
    .sort((a, b) => {
        return a.path.length - b.path.length;
    });

    const shortDistance = [];

    if (playerDistance.length) {
        shortDistance.push(playerDistance[0]);
    }
    if (choppersDistance.length) {
        shortDistance.push(choppersDistance[0]);
    }
    if (perkDistance.length) {
        shortDistance.push(perkDistance[0]);
    }
    shortDistance.sort((a, b) => {
        return a.path.length - b.path.length;
    });

    const next = getCommandByCoord(hero.x, hero.y, shortDistance[0].path[1][0], shortDistance[0].path[1][1]);
    data.action = next.name;

    // data.action

    if (
        hero.bombsCount > 0
        && (board.countElementsAroundPt(hero, board.meatChoppers, 2)
            || board.countElementsAroundPt(hero, board.players, 2)
            || (board.countElementsAroundPt(hero, board.destroyableWalls, 3) > 2 && shortDistance[0].path.length > 4)
        )
    ) {
        data.action = 'ACT,' + data.action;
    }
    return data.action;
}
