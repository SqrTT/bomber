// @ts-check
const { Worker, parentPort } = require('worker_threads');
const { calc } = require('./calculateScore');



parentPort.on('message', (messageStr) => {
    const message = JSON.parse(messageStr);
    //console.log(message);
    parentPort.postMessage(JSON.stringify({
        uuid: message.uuid,
        data: {
            score: calc(message.data),
            action: message.data.action
        }
    }));
});
