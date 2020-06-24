// @ts-check

var util = require('util');
var WSocket = require('ws');
const { Element } = require("./src/Constants");

const { GameState } = require("./src/GameState");
const { GameStates, GameStatesStr } = require("./src/GameStates");


// const { Worker } = require('worker_threads');
// const workers = [
//     new Worker('./src/worker.js'),
//     new Worker('./src/worker.js'),
//     new Worker('./src/worker.js'),
//     new Worker('./src/worker.js'),
//     new Worker('./src/worker.js'),
//     new Worker('./src/worker.js')
// ];
// workers.forEach(worker => {
//     worker.on('error', (err) => {
//         console.error(err)
//     });
//     worker.on('exit', (code) => {
//         console.error(`Worker exited: ${code}`)
//     });
// })
// /**
//  * @param {number} workerID
//  */
// function passToWorkerIdWorker(workerID, data) {
//     return new Promise(resolve => {
//         const uuid = getNextID();
//         const worker = workers[workerID];
//         const cb = (msgStr) => {
//             const msg = JSON.parse(msgStr);
//             if (msg.uuid === uuid) {
//                 resolve(msg.data);
//                 worker.off('message', cb);
//             }
//         }
//         worker.on('message', cb);
//         worker.postMessage(JSON.stringify({
//             uuid,
//             data
//         }));
//     })
// }

var wss;
const wsClients = [];
if (!process.argv.includes('bot')) {
    wss = new WSocket.Server({
        port: process.env.SOCK_PORT || 33333
    });
    /**
     * @type {WSocket[]}
     */
    wss.on('connection', function connection(ws) {
        wsClients.push(ws);
    });
}

function sendToClients(data) {
    wsClients.forEach(client => {
        if (client.readyState === WSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}


var stdin = process.stdin;
process.stdin.setRawMode && process.stdin.setRawMode(true);

var nextMove = '';

stdin.addListener("data", function (d) {
    const charCode = d.toString().charCodeAt(0);
    const char = d.toString();
    if (charCode == 3) {
        process.exit();
    }
    if (char === 'a') {
        nextMove = 'LEFT';
    } else if (char === 'd') {
        nextMove = "RIGHT";
    } else if (char === 's') {
        nextMove = 'DOWN';
    } else if (char === 'w') {
        nextMove === 'UP'
    } else if (char === ' ') {
        nextMove = 'ACT';
    }
});

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



function passToPseudoIdWorker(workerID, data) {
    return new Promise(resolve => {
        const { calc } = require('./src/calculateScore.js');
        const score = calc(data);

        resolve({
            score,
            parsed: data
        });
    })
}

// const passToWorkerId = passToWorkerIdWorker;
const passToWorkerId = process.argv.includes('live') ? passToPseudoIdWorker : passToPseudoIdWorker;


/**
 *
 * @param {string} boardString
 */
async function processBoard(boardString) {
    var answer = 'ACT';
    var scores = [];
    gameState.tick(boardString);
    const boardSize = Math.sqrt(boardString.length);

    const time = Date.now();
    if (gameState.getState() === GameStates.IN_PROGRESS) {
        let bomberPosition = boardString.indexOf(Element.BOMBERMAN);
        if (bomberPosition === -1) {
            bomberPosition = boardString.indexOf(Element.BOMB_BOMBERMAN);
        }

        const { score: result, parsed } = await passToWorkerId(0, {
            board: boardString,
            gameState,
        });

        const bestScore = result;
        answer = nextMove || result || '';

        if (nextMove) {
            nextMove = '';
        }

        scores = result;

        sendToClients({
            answer,
            bestScore,
            boardString,
            gameState,
            parsed
        });

    } else {
        answer = 'STOP';
        sendToClients({
            answer,
            boardString,
            gameState
        });
    }

    var logMessage = boardAsString(boardString, boardSize) + "\n\n";

    logMessage += "Answer: " + answer + `: ${GameStatesStr[gameState.getState()]} : ${gameState.getTick()} : ${Date.now() - time}\n`;
    logMessage += `bombs: ${gameState.hero && gameState.hero.bombsCount} \n`;
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


