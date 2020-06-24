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


exports.calc = function (data) {
    const board = new Board(data.gameState);

    const hero = board.getHero();

    data.scores = board.toWalkMatrix();
    let usePerk;
    const perk = getNearestPerk(board, hero);
    if (perk && perk.path.length < 10) {
        usePerk = perk;
    }

    /// step
    let shortDistance = usePerk || getNearestPlayer (board, hero) || getNearestChopper(board, hero) || getNearestPerk(board, hero);

    if (!shortDistance) {
        return 'STOP';
    }

    if (shortDistance.path.length < (hero.bombsPower + 1) &&  hero.bombsCount < 1) {
        // find next bomber
        shortDistance = getNearestPlayer(board, hero, true) || getNearestChopper(board, hero, true) || getNearestPerk(board, hero, true);
    }
    if (!shortDistance) {
        return 'ACT';
    }

    const next = getCommandByCoord(hero.x, hero.y, shortDistance.path[1][0], shortDistance.path[1][1]);
    data.action = next.name;

    data.nextPath = shortDistance.path;

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
            if (scoresAround.some(a => a < currentScore )) {
                data.action =  data.action + ',ACT';
            }
        }

    }

    return data.action;
}
function getNearestPerk(board, hero, last) {
    const perks = board.getUsefulPerks().map(ch => ({
        perk: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1])
        .sort((a, b) => {
            return a.path.length - b.path.length;
        });

    return perks[last ? perks.length - 1: 0];
}

function getNearestPlayer(board, hero, last = false) {
    const players = board.players.filter(p => p.alive).map(ch => ({
        player: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1])
        .sort((a, b) => {
            return a.path.length - b.path.length;
        });

    return players[last ? players.length - 1 : 0]
}

function getNearestChopper(board, hero, last = false) {
    const choppers = board.meatChoppers.map(ch => ({
        ch: ch,
        path: getPaths(board, hero, ch)
    })).filter(p => p.path && p.path.length && p.path[1]).sort((a, b) => {
        return a.path.length - b.path.length;
    });

    return choppers[last ? choppers.length - 1 : 0];
}

