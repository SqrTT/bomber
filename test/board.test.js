var assert = require('assert');
const { Board } = require('../src/Board');
const { GameState } = require('../src/GameState');
const { settings } = require('../src/Constants');



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
☼#                   ♥☼
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

    it('should calculate scores', () => {
        const weight = boardInstance.getScoresBoard();

        assert.equal(weight[1][8], settings.killMeatChopperScore);
        //assert.equal(weight[21][21], settings.killOtherHeroScore);
    });
});
