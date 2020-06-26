const { Board } = require("./Board");
const { Direction, Element, getCommandByCoord, DirectionList } = require("./Constants");
const Point = require("./Point");
const { default: AStar } = require('dynamic-astar');
const { GameState } = require("./GameState");
const Bomb = require("./Bomb");


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

function buildNode(x, y, fromNode, cost = 1, step = 0) {
    return {
        id: `${x}-${y}`,
        cost: fromNode.cost + cost,
        costEstimation: estimation(x, y, fromNode.finish),
        x: x,
        y: y,
        step,
        finish: fromNode.finish,
    };
}

function getPaths(board, fromPT, toPt) {

    function getNeighbors(node) {
        const matrix = board.toWalkMatrix(node.step);
        const x = node.x, y = node.y;
        const nodes = [];
        if (x > 0 && matrix[y][x - 1]) {
            nodes.push(buildNode(x - 1, y, node, matrix[y][x - 1], node.step + 1));
        }
        if (y > 0 && matrix[y - 1][x]) {
            nodes.push(buildNode(x, y - 1, node, matrix[y - 1][x], node.step + 1));
        }
        if (node.x + 1 < board.size && matrix[y][x + 1]) {
            nodes.push(buildNode(x + 1, y, node, matrix[y][x + 1], node.step + 1));
        }
        if (node.y + 1 < board.size && matrix[y + 1][x]) {
            nodes.push(buildNode(x, y + 1, node, matrix[y + 1][x], node.step + 1));
        }
        return nodes;
    }

    const target = { x: toPt.x, y: toPt.y };
    const firstNode = {
        id: `${fromPT.x}-${fromPT.y}`,
        x: fromPT.x,
        y: fromPT.y,
        cost: 0,
        step: 0,
        costEstimation: estimation(0, 6, target),
        finish: target,
    };
    const path = AStar(firstNode, getNeighbors) || [];

    return path.map(p => [p.x, p.y]);
}

exports.getPaths = getPaths;


exports.calc = function (data) {
    /**
     * @type {GameState}
     */
    const gameState = data.gameState
    const board = new Board(data.gameState);

    const hero = board.getHero();

    data.scores = board.toWalkMatrix(0);
    let usePerk;
    const perk = getNearestPerk(board, hero);
    if (perk && perk.path.length < 15) {
        usePerk = perk;
    }

    /// step
    let shortDistance = usePerk || getNearestPlayer(board, hero) || getNearestChopper(board, hero) || getNearestPerk(board, hero);

    if (!shortDistance) {
        return 'STOP';
    }

    if (shortDistance.path.length < (hero.bombsPower + 1) && hero.bombsCount < 1) {
        // find next bomber
        shortDistance = getNearestPlayer(board, hero, true) || getNearestChopper(board, hero, true) || getNearestPerk(board, hero, true);
    }
    if (!shortDistance) {
        return 'ACT';
    }

    const next = getCommandByCoord(hero.x, hero.y, shortDistance.path[1][0], shortDistance.path[1][1]);
    data.action = next.name;

    data.nextPath = shortDistance.path;
    const nextHeroPos = next.nextPoint(hero);

    // has rc bomb
    const rcBomb = board.bombs.find(bomb => bomb.owner === -1 && bomb.rc);
    if (rcBomb) {
        // is next step safe from rc bomb?
        const someWall = board.walls.concat(board.destroyableWalls);
        const isHeroOnTheWay = DirectionList.some(dir => {
            var currentPoint = dir.nextPoint(rcBomb);

            for (var d = 1; d <= rcBomb.power; d++) {
                if (
                    someWall.some(w => w.equals(currentPoint)) ||
                    board.players.some(b => b.equals(currentPoint)) ||
                    board.meatChoppers.some(b => b.equals(currentPoint))
                ) {
                    break;
                } else if (nextHeroPos.equals(currentPoint)) {
                    return true;
                }
                currentPoint = dir.nextPoint(currentPoint);
            }
            return false;
        })

        if (!isHeroOnTheWay) {
            data.action = data.action + ',ACT'; // make step and blow
        }
    } else if (hero.bombsCount > 0 && !board.perks[Element.BOMB_REMOTE_CONTROL].some(rc => rc.equals(nextHeroPos))) {
        const scores = board.getScoresBoard();

        const currentScore = scores[hero.y][hero.x];
        const newScore = scores[nextHeroPos.y][nextHeroPos.x];

        if (newScore > currentScore) {
            data.action = data.action + ',ACT';
        } else if (newScore < currentScore) {
            data.action = 'ACT,' + data.action;
            gameState.bombs.push(new Bomb(-1, hero.x, hero.y, hero.bombsPower, undefined, hero.rcBombCount > 0));
            hero.rcBombCount && hero.rcBombCount--;
            hero.bombsCount && hero.bombsCount--;
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

    return perks[last ? perks.length - 1 : 0];
}

function getNearestPlayer(board, hero, last = false) {
    var aliveCount = board.players.filter(p => p.alive).length;

    const players = board.players.filter(p => p.alive).concat(aliveCount < 3 ? board.meatChoppers : []).map(ch => ({
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

