const { Board } = require("./Board");
const { Direction, Element, getCommandByCoord, DirectionList } = require("./Constants");
const Point = require("./Point");
const {default: AStar} = require('dynamic-astar');


// function getPaths(board, fromPT, toPt) {
//     const grid = new PF.Grid(board.toWalkMatrix());
//     grid.setWalkableAt(toPt.x, toPt.y, true);
//     const finder = new PF.AStarFinder();

//     var path = finder.findPath(fromPT.x, fromPT.y, toPt.x, toPt.y, grid);
//     return path;
// }

function estimation(x, y, finish) {
    return Math.abs(x - finish.x) + Math.abs(y - finish.y);
}

function buildNode(x, y, fromNode, cost = 1) {
    return {
        id: `${x}-${y}`,
        cost: fromNode.cost + cost,
        costEstimation: estimation(x, y, fromNode.finish),
        x: x,
        y: y,
        finish: fromNode.finish,
    };
}

function getPaths(board, fromPT, toPt) {
    const matrix = board.toWalkMatrix();

    function getNeighbors(node) {
        const x = node.x, y = node.y;
        const nodes = [];
        if (x > 0 && matrix[y][x -1]) {
            nodes.push(buildNode(x - 1, y, node, matrix[y][x -1]));
        }
        if (y > 0 && matrix[y - 1][x]) {
            nodes.push(buildNode(x, y - 1, node, matrix[y - 1][x]));
        }
        if (node.x + 1 < board.size && matrix[y][x + 1]) {
            nodes.push(buildNode(x + 1, y, node, matrix[y][x + 1]));
        }
        if (node.y + 1 < board.size && matrix[y + 1][x]) {
            nodes.push(buildNode(x, y + 1, node, matrix[y + 1][x]));
        }
        return nodes;
    }

    const target = { x: toPt.x, y: toPt.y };
    const firstNode = {
        id: `${fromPT.x}-${fromPT.y}`,
        x: fromPT.x,
        y: fromPT.y,
        cost: 0,
        costEstimation: estimation(0, 6, target),
        finish: target,
    };
    const path = AStar(firstNode, getNeighbors) || [];

    return path.map(p => [p.x, p.y]);
}

exports.getPaths = getPaths;

function hasExit(board, pos) {
    return 1 < board.countElementsAroundPt(pos, board.getBarriers());
}

exports.calc = function (data) {
    const board = new Board(data.gameState);

    const hero = board.getHero();

    data.scores = board.toWalkMatrix();

    const wallsAround = board.countElementsAroundPt(hero, board.walls.concat(board.destroyableWalls));
    if (wallsAround === 4) {
        5
        return 'ACT';
    }

    /// step
    const shortDistance = getNearestPlayer(board, hero) || getNearestChopper(board, hero) || getNearestPerk(board, hero)

    const next = getCommandByCoord(hero.x, hero.y, shortDistance.path[1][0], shortDistance.path[1][1]);
    data.action = next.name;

    // data.action

    if (hero.bombsCount > 0) {
        const scores = board.getScoresBoard();
        const nextHeroDir = Direction[next];

        if (nextHeroDir) {
            const nextHero = nextHeroDir.nextPoint(hero);
            const currentScore = scores[nextHero.y][nextHero.x];

            const scoresAround = DirectionList.map(dir => {
                const pt = dir.nextPoint(nextHero);
                return scores[pt.y][pt.x];
            });
            if (scoresAround.some(a => a < currentScore)) {
                data.action =  data.action + ',ACT';
            }
        }

    }

    return data.action;
}
function getNearestPerk(board, hero) {
    return board.getUsefulPerks().map(ch => ({
        ch: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1])
        .sort((a, b) => {
            return a.path.length - b.path.length;
        })[0];
}

function getNearestPlayer(board, hero) {
    return board.players.filter(p => p.alive).map(ch => ({
        player: ch,
        path: ch.alive && getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1])
        .sort((a, b) => {
            return a.path.length - b.path.length;
        })[0];
}

function getNearestChopper(board, hero) {
    return board.meatChoppers.map(ch => ({
        ch: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1]).sort((a, b) => {
        return a.path.length - b.path.length;
    })[0];
}

