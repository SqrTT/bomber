var assert = require('assert');
const { Board } = require('../src/Board');
describe('Board', function () {
    const board = (`
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
☼        & &          ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼#☼
☼   ##  # # ##     # #☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼ #             # #   ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼# # ##     #    ##   ☼
☼ ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
☼  c  #       #      &☼
☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
☼ # +             # # ☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼
☼   #           #    #☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼&☼#☼&☼
☼                 ####☼
☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼
☼ ☺   #      3       #☼
☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼         #     #   # ☼
☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
☼#                    ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

    const boardInstance = new Board(board);
    it('should create board', function () {
        assert.notEqual(boardInstance, null);
    });

    it('should contain actors', function () {
        const activeActors = boardInstance.getActiveActors();
        assert.equal(activeActors.length, 6);
    });

    it('should have a hero', function () {
        const hero = boardInstance.getHero();
        assert.notEqual(hero, undefined);
    });

    it('should return element of board', function () {
        const hero = boardInstance.getElementAt(2, 17);
        assert.equal(hero, '☺');
    });

});
