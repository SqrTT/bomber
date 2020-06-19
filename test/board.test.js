var assert = require('assert');
const { Board } = require('../src/Board');
const { GameState } = require('../src/GameState');



function getBoard(boardStr) {
    const state = new GameState();
    state.initBoard(boardStr);
    return new Board(state);
}

describe('Board', function () {
    const board = (`
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
☼        &            ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼#☼
☼   ##  # # ##     # #☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼ #             # #   ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼# # ##     #    ##   ☼
☼ ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
☼  c  #       #       ☼
☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
☼ # +             # # ☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼
☼   #           #    #☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
☼                 ####☼
☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼
☼ ☺   #      3       #☼
☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼         #     #   # ☼
☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
☼#                    ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

    const boardInstance = getBoard(board);
    it('should create board', function () {
        assert.notEqual(boardInstance, null);
    });

    it('should have a hero', function () {
        const hero = boardInstance.getHero();
        assert.notEqual(hero, undefined);
    });

    it('should have a hero', function () {
        const meatChoppers = boardInstance.meatChoppers;
        assert.equal(meatChoppers.length, 1);
        const meatChopper = meatChoppers[0];
        assert.equal(meatChopper.x, 9);

        assert.equal(meatChopper.y, 1);
    });
});
