const { Board } = require("./Board");
const { Direction, Element, getCommandByCoord, DirectionList, isWalkableElement, isBomb, range } = require("./Constants");
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

/**
 *
 * @param {Board} board
 */
function getBetterWall(board) {
    const matrix = board.getScoresBoard();

    function buildNodeWall(x, y, score = 0, step = 0, cost = 1, fromNode) {
        let costEstimation = 999;
        if (score === 3 && step < 7) {
            costEstimation = 0;
        } else if (score === 2 && step < 6) {
            costEstimation = 0;
        }
        return {
            id: `${x}-${y}`,
            cost: fromNode.cost + cost,
            costEstimation: costEstimation,
            x: x,
            y: y,
            step
        };
    }

    function getNeighbors(node) {
        const x = node.x, y = node.y;
        const costMatrix = board.toWalkMatrix(node.step);

        const nodes = [];
        if (x > 0 && costMatrix[y][x - 1]) {
            nodes.push(buildNodeWall(x - 1, y, matrix[y][x - 1], node.step + 1, costMatrix[y][x - 1], node));
        }
        if (y > 0 && costMatrix[y - 1][x]) {
            nodes.push(buildNodeWall(x, y - 1, matrix[y - 1][x], node.step + 1, costMatrix[y - 1][x], node));
        }
        if (node.x + 1 < board.size && costMatrix[y][x + 1]) {
            nodes.push(buildNodeWall(x + 1, y, matrix[y][x + 1], node.step + 1, costMatrix[y][x + 1], node));
        }
        if (node.y + 1 < board.size && costMatrix[y + 1][x]) {
            nodes.push(buildNodeWall(x, y + 1, matrix[y + 1][x], node.step + 1, costMatrix[y + 1][x], node));
        }
        return nodes;
    }

    const firstNode = {
        id: `${board.hero.x}-${board.hero.y}`,
        x: board.hero.x,
        y: board.hero.y,
        cost: 0,
        step: 0,
        costEstimation: 999
    };
    const path = AStar(firstNode, getNeighbors) || [];

    return path.map(p => [p.x, p.y]);
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

    const score = board.getScoresBoard();
    data.scores = score;
    const [dist, par] = board.bfs(hero.x, hero.y);

    let best = -1;
    let tx,ty,tt;
    let next_bomb = board.nextHeroBombAvailable()
    // Choose best target using ratio score/distance
    for (const j of range(0, board.size)) {
        for (const i of range(0, board.size)) {
            if (score[j][i] < 0) {
                continue
            }
            for (const t of range(1, 7)) {
                if (dist[j][i][t] < 0 || dist[j][i][t] > 1e8) {
                    continue
                }
                let sc = score[j][i];

                if (t < next_bomb) { // # I can't place bomb earlier
                    sc = (sc % 10) // 5 * 5  # Count only perk
                }
                if (dist[j][i][t] > 1000) { //  # If I am close to die I can only think about surviving.
                    sc = 0
                }
                let cur = sc / (dist[j][i][t] + 1)
                if (cur > best && board.canSurvive(i, j, t, score)) {
                    best = cur
                    tx = i
                    ty = j
                    tt = t
                }
            }
        }
    }
    let nextDir = Direction.STOP;
    const nextPath = [];
    data.nextPath = nextPath;
    const Tx = tx;
    const Ty = ty;
    const Tt = tt;

    if (best > 0) {
        // Tx, Ty, Tt = tx, ty, tt
        let ptx = tx;
        let pty = ty;
        let ptt = tt;

        while (tx != hero.x || ty != hero.y || tt != 0) {  // # Looking for next point on the way to target
            nextPath.push([tx, ty]);
            ptx = tx;
            pty = ty;
            ptt = ptt;
            ([ty, tx, tt] = par[ty][tx][tt])
        }
       // print(f'Target {Tx} {Ty} {Tt} {dist[Tx][Ty][Tt]} {score[Tx][Ty]} {dist[ptx][pty][1]}')

        if (ptx < tx) {
            nextDir = Direction.LEFT;
        } else if (ptx > tx) {
            nextDir = Direction.RIGHT;
        } else if (pty < ty) {
            nextDir = Direction.UP;
        } else if (pty > ty) {
            nextDir = Direction.DOWN
        }
    }

    const nextHeroPos = nextDir.nextPoint(hero);
    data.action = nextDir.name;

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
    } else if (hero.bombsCount > 0) {
        if (Tt <= 1 && score[Ty][Tx] > 0 && score[Ty][Tx] != 5 && (score[Ty][Tx] >= 15 || !board.canKillPerk(new Point(Tx, Ty))) && board.canSurvive(Tx, Ty, 1, score)) {
            data.action = [nextDir.name, Direction.ACT.name].join(',');
        }
    }


    return data.action;
}



