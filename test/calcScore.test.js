const assert = require('assert');
const { Board } = require('../src/Board');
const { calc } = require('../src/calculateScore');
const { GameState } = require('../src/GameState');


function getBoard(boardStr) {
    const state = new GameState();
    state.initBoard(boardStr);
    return new Board(state);
}

describe('score calc', function () {
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


    it('should create board', function () {
        const res = calc({
            gameState: getBoard(board),
            action: 'LEFT'
        })

        assert.equal(res, 8);
    });

    it('should see walls amount', function () {
        const res = calc({
            gameState: getBoard(board),
            action: 'RIGHT'
        })

        assert.equal(res, 10);
    });

    const bombBoard = (`
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
☼  3              ####☼
☼2☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼
☼ ☺   #      3       #☼
☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼         #     #   # ☼
☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
☼#                    ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

    it('should see bombs amount', function () {
        const res = calc({
            gameState: getBoard(bombBoard),
            action: 'LEFT'
        })

        assert(res < 0, 'avoid bomb');

        const res2 = calc({
            gameState: getBoard(bombBoard),
            action: 'RIGHT',
            bombsCount: 0
        })

        assert(res2 < 0);
    });


    it('should way bombs', function () {
        const bombBoard = (`
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
☼#   #    #           ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
☼     #    ###  #  ♥  ☼
☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
☼  #            ##    ☼
☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼♥      &  #  ##     #☼
☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼#☼
☼     #   ##          ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼#                    ☼
☼♥☼ ☼ ☼ ☼#☼☺☼ ☼ ☼ ☼ ☼ ☼
☼  2     ## #      &# ☼
☼ ☼ ☼ ☼ ☼ ☼1☼#☼ ☼ ☼ ☼#☼
☼  #    &       #   # ☼
☼#☼#☼&☼ ☼ ☼ ☼♥☼ ☼#☼ ☼ ☼
☼           #       # ☼
☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
☼        #      # &   ☼
☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼      ##  ## #   #   ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard),
            action: 'STOP'
        })

        assert.ok(res < -0);

    });

    it('should way bombs 2', function () {
        const bombBoard = (`
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
☼  #   #              ☼
☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
☼  #        ##    ##  ☼
☼&☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
☼     # # #  ♠# #   # ☼
☼ ☼ ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼#☼
☼             # &     ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
☼  #              #  #☼
☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼##      # # #        ☼
☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
☼     #♥         #    ☼
☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼ #              &   #☼
☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼   # ☺1    &         ☼
☼♥☼ ☼i☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
☼     #  #   ##   ## #☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
☼   &    #   ##       ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard),
            action: 'STOP',
            bombsCount: 0
        })

        assert.ok(res < 0);
    });

    it('should way bombs 2', function () {
        const bombBoard = (`
                ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
                ☼          #    #     ☼
                ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼
                ☼#         #          ☼
                ☼ ☼ ☼҉☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
                ☼#  ♥҉    #   &    #  ☼
                ☼ ☼ ☼҉☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼
                ☼ ҉҉҉҉҉҉҉    #  #   # ☼
                ☼ ☼♥☼҉☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼
                ☼    ҉   ##  #      # ☼
                ☼ ☼ ☼҉☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
                ☼       #  #  #    # #☼
                ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
                ☼♥3      ☻ #      # # ☼
                ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
                ☼#r        ##  #      ☼
                ☼#☼ ☼r☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
                ☼         #  ##&    ##☼
                ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
                ☼  &# #   #           ☼
                ☼ ☼ ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
                ☼#   #  # #&         #☼
                ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard),
            action: 'RIGHT'
        })

        assert.ok(res < 0);

    });

    it('should way bombs 3', function () {
        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼    #      ##  # # # ☼
        ☼&☼#☼ ☼ ☼ ☼ ☼#☼ ☼ ☼#☼ ☼
        ☼       #   #     #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼#☼
        ☼      #     &  ##    ☼
        ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼  #   &      #       ☼
        ☼ ☼♥☼#☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼ #         ##   &    ☼
        ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼    #                ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼      #   ҉  #  #    ☼
        ☼ ☼#☼#☼ ☼ ☼҉☼ ☼ ☼ ☼#☼ ☼
        ☼# ###  ## ҉       #  ☼
        ☼ ☼ ☼ ☼ ☼ ☼҉☼ ☼ ☼ ☼#☼#☼
        ☼#     #   ҉       ☻# ☼
        ☼#☼ ☼ ☼ ☼ ☼҉☼ ☼ ☼ ☼ ☼ ☼
        ☼  #       ҉ ♥     #  ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   #            i   &☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard),
            action: 'DOWN'
        })

        assert.ok(res < 0);

    });
});
