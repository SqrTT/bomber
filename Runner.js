// @ts-check

var util = require('util');
var WSocket = require('ws');
const { Worker } = require('worker_threads');
const { Element, isWalkableElement} = require("./src/Constants");

const { GameState } = require("./src/GameState");
const { GameStates, GameStatesStr } = require("./src/GameStates");


const workers = [
    new Worker('./src/worker.js'),
    new Worker('./src/worker.js'),
    new Worker('./src/worker.js'),
    new Worker('./src/worker.js'),
    new Worker('./src/worker.js'),
    new Worker('./src/worker.js')
];

workers.forEach(worker => {
    worker.on('error', (err) => {
        console.error(err)
    });
    worker.on('exit', (code) => {
        console.error(`Worker exited: ${code}`)
    });
})


var log = function (string) {
    console.log(string);
};

function boardAsString(board, size) {
    var result = "";
    for (var i = 0; i < size; i++) {
        result += board.substring(i * size, (i + 1) * size);
        result += "\n";
    }
    return result;
};

var uniqID = 0;
function getNextID() {
    return ++uniqID;
}

/**
 * @param {number} workerID
 */
function passToWorkerIdWorker(workerID, data) {
    return new Promise(resolve => {
        const uuid = getNextID();
        const worker = workers[workerID];
        const cb = (msgStr) => {
            const msg = JSON.parse(msgStr);
            if (msg.uuid === uuid) {
                resolve(msg.data);
                worker.off('message', cb);
            }
        }
        worker.on('message', cb);
        worker.postMessage(JSON.stringify({
            uuid,
            data
        }));
    })
}

function passToPseudoIdWorker(workerID, data) {
    return new Promise(resolve => {
        const { calc } = require('./src/calculateScore.js');
        const parsed = JSON.parse(JSON.stringify(data));
        const score = calc(parsed);

        resolve({
            score,
            action: parsed.action
        });
    })
}

// const passToWorkerId = passToWorkerIdWorker;
const passToWorkerId = passToPseudoIdWorker;


/**
 *
 * @param {string} boardString
 */
async function processBoard(boardString) {
    var answer = 'ACT';
    var scores = [];
    gameState.tick(boardString);
    const boardSize = Math.sqrt(boardString.length);

    if (gameState.getState() === GameStates.IN_PROGRESS) {
        let bomberPosition = boardString.indexOf(Element.BOMBERMAN);
        if (bomberPosition === -1) {
            bomberPosition = boardString.indexOf(Element.BOMB_BOMBERMAN);
        }
        const actions = [];

        if (isWalkableElement(boardString[bomberPosition + 1])) {
            actions.push('RIGHT')
        }
        if (isWalkableElement(boardString[bomberPosition - 1])) {
            actions.push('LEFT')
        }
        if (isWalkableElement(boardString[bomberPosition + boardSize])) {
            actions.push('DOWN')
        }
        if (isWalkableElement(boardString[bomberPosition - boardSize])) {
            actions.push('UP')
        }

        actions.push('STOP');

        const result = await Promise.all(actions.map((action, idx) => {
            const pr = passToWorkerId(idx, {
                board: boardString,
                gameState,
                tick: gameState.getTick(),
                bombDistance: 3,
                action
            })
            return pr;
        }));

        const bestScore = result.sort((a, b) => {
            return b.score - a.score;
        })[0];
        answer = (bestScore && bestScore.action) || '';

        scores = result;

    } else {
        answer = 'STOP';
    }

    var logMessage = boardAsString(boardString, boardSize) + "\n\n";

    logMessage += "Answer: " + answer + `: ${GameStatesStr[gameState.getState()]} : ${gameState.getTick()}\n`;
    logMessage += `bombs: ${gameState.hero.bombsCount} - ${JSON.stringify(scores)}\n`;
    logMessage += "-----------------------------------\n";

    log(logMessage);

    return answer;
};

// you can get this code after registration on the server with your email
var url = process.env.GAME_URL || "http://127.0.0.1:8080/codenjoy-contest/board/player/ididididididididid?code=12345678901234567890";
url = url.replace("http", "ws");
url = url.replace("board/player/", "ws?user=");
url = url.replace("?code=", "&code=");

const gameState = new GameState();

async function connect() {
    const ws = new WSocket(url);
    log('Opening...');

    ws.on('open', function () {
        log('Web socket client opened ' + url);
    });

    ws.on('close', function () {
        log('Web socket client closed');

        setTimeout(function () {
            connect();
        }, 5000);
    });

    ws.on('message', async function (message) {
        var answer = await processBoard(message.toString().substr(6));
        ws.send(answer);
    });
}

connect();

function random(n) {
    return Math.floor(Math.random() * n);
};


