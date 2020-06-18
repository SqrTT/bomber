const { Board } = require("./Board");

//
function random(n) {
    return Math.floor(Math.random() * n);
};


exports.calc = function (data) {
    const board = new Board(data.board);
    return random(100)
}
