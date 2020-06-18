// @ts-check
/*-
 * #%L
 * Codenjoy - it's a dojo-like platform from developers to developers.
 * %%
 * Copyright (C) 2018 Codenjoy
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/gpl-3.0.html>.
 * #L%
 */

// TODO test me

var util = require('util');
var WSocket = require('ws');
const { Worker } = require('worker_threads');
const { Element, isWalkableElement } = require("./src/Constants");

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
function passToWorkerId(workerID, data) {
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

/**
 *
 * @param {string} boardString
 */
async function processBoard(boardString) {
    var answer = 'ACT';
    gameState.tick(boardString);
    const boardSize = Math.sqrt(boardString.length);


    if (gameState.getState() === GameStates.IN_PROGRESS) {
        let bomberPosition = boardString.indexOf(Element.BOMBERMAN);
        if (bomberPosition === -1) {
            bomberPosition = boardString.indexOf(Element.BOMB_BOMBERMAN);
        }
        const actions = ['STOP'];

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
        if (gameState.hasBomb()) {
            actions.push('ACT')
        }

        const result = await Promise.all(actions.map((action, idx) => {
            const pr = passToWorkerId(idx, {
                board: boardString,
                tick: gameState.getTick(),
                bombsCount: gameState._bombs_count,
                bombTicks: gameState._bomb_ticks,
                bombDistance: 4,
                action
            })
            return pr;
        }));

        const bestScore = result.sort((a, b) => {
            return  b.score - a.score;
        })[0];
        answer = bestScore.action;

        if (answer.includes('ACT')) {
            gameState.useBomb();
        }
    } else {
        answer = 'STOP';
    }

    var logMessage = boardAsString(boardString, boardSize) + "\n\n";

    logMessage += "Answer: " + answer + `: ${gameState.getState()} : ${gameState.getTick()}\n`  ;
    logMessage += `hasBomb: ${gameState.hasBomb()}\n`;
    logMessage += "-----------------------------------\n";

    log(logMessage);

    return answer;
};

// you can get this code after registration on the server with your email
var url = "http://127.0.0.1:8080/codenjoy-contest/board/player/ididididididididid?code=12345678901234567890";

url = url.replace("http", "ws");
url = url.replace("board/player/", "ws?user=");
url = url.replace("?code=", "&code=");

const GameStates = {
    WAIT_FOR_START: 0,
    IN_PROGRESS: 1,
    OVER: 2
}
class GameState {
    constructor() {
        this._state = GameStates.OVER;
        this._tick = 0;
        this._bombs_count = 1;
        this._bomb_ticks = [];
    }
    getState() {
        return this._state;
    }
    setState(state) {
        this._state = state;
    }
    tick(boardString) {
        if (boardString.includes(Element.BOMBERMAN) || boardString.includes(Element.BOMB_BOMBERMAN)) {
            if (this._state !== GameStates.IN_PROGRESS) {
                this._state = GameStates.IN_PROGRESS;
                this.resetTicks();
            } else {
                this._tick++;
                this._bomb_ticks = this._bomb_ticks.filter(bomb_tick => {
                    if (bomb_tick + 4 < this._tick) {
                        this._bombs_count++;
                        return false;
                    } else {
                        return true;
                    }
                });
            }
        } else if (boardString.includes(Element.DEAD_BOMBERMAN)) {
            this._state = GameStates.OVER;
        } else {
            this._state = GameStates.WAIT_FOR_START;
        }
    }
    resetTicks() {
        this._tick = 0;
        this._bombs_count = 1;
        this._bomb_ticks = [];
    }
    hasBomb() {
        return this._bombs_count > 0;
    }
    useBomb() {
        if (this.hasBomb()) {
            this._bombs_count--;
            this._bomb_ticks.push(this.getTick() + 1)
        }
    }
    getTick() {
        return this._tick;
    }
}

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


