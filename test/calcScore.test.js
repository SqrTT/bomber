const assert = require('assert');
const { Board } = require('../src/Board');
const { calc, getPaths } = require('../src/calculateScore');
const { GameState } = require('../src/GameState');
const Point = require('../src/Point');


function getBoard(boardStr) {
    const state = new GameState();
    state.initBoard(boardStr);
    return new Board(state);
}

function checkBoard(board, answer) {
    const bombBoard = (board).replace(/\n +/ig, '');

    const res = calc({
        gameState: getBoard(bombBoard)
    })

    assert.equal(res, answer);
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
☼             ♥   ####☼
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
        })

        assert.equal(res, 'RIGHT');
    });

    it('should see walls amount', function () {
        const res = calc({
            gameState: getBoard(board),
            action: 'RIGHT'
        })

        assert.equal(res, 'RIGHT');
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
☼  1              ####☼
☼1☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼
☼ ☺   #      3       #☼
☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
☼         #     #   # ☼
☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
☼#                    ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

    it('should see bombs amount', function () {
        const res = calc({
            gameState: getBoard(bombBoard)
        })

        assert(res, 'STOP');
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
        })

        assert.ok(res, 'UP');
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
        })

        assert.equal(res, 'LEFT');
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
            gameState: getBoard(bombBoard)
        })

        assert.notEqual(res, 'STOP');

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
        })

        assert.match(res, /LEFT|DOWN/);
    });

    it('should handle closed space', () => {
        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼   #  &       #   #☺ ☼
        ☼ ☼#☼ ☼#☼ ☼#☼ ☼ ☼#☼ ☼ ☼
        ☼  #                 #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼##    # #  #     #   ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼
        ☼  #   #     & ##     ☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#    #               ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼    &                ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼#☼#☼
        ☼     # #         #   ☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼## #           +##   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼#☼ ☼ ☼
        ☼#    #   #       #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼#☼ ☼#☼#☼ ☼
        ☼ #     #      #      ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard)
        })

        assert.equal(res, 'ACT');
    });

    it('should det way from bomb', () => {
        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼   #  &       #   #☻ ☼
        ☼ ☼#☼ ☼#☼ ☼#☼ ☼ ☼#☼ ☼ ☼
        ☼  #                 #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼##    # #  #     #   ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼
        ☼  #   #     & ##     ☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#    #               ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼    &                ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼#☼#☼
        ☼     # #         #   ☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼## #           +##   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼#☼ ☼ ☼
        ☼#    #   #       #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼#☼ ☼#☼#☼ ☼
        ☼ #     #      #      ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard)
        })

        assert.equal(res, 'RIGHT');
    })

    it('should det way from bomb even more', () => {
        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼   #  &       #   #3☺☼
        ☼ ☼#☼ ☼#☼ ☼#☼ ☼ ☼#☼ ☼ ☼
        ☼  #                 #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼##    # #  #     #   ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼
        ☼  #   #     & ##     ☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#    #               ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼    &                ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼#☼#☼
        ☼     # #         #   ☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼## #           +##   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼#☼ ☼ ☼
        ☼#    #   #       #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼#☼ ☼#☼#☼ ☼
        ☼ #     #      #      ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard)
        })

        assert.equal(res, 'DOWN');
    });

    it('should det way from bomb even more', () => {
        checkBoard(`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼      #       # ☻    ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼ ##  #   ##         #☼
        ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼      # 3♥ # #  #    ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼
        ☼##   #           ##  ☼
        ☼#☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼ ##  ##              ☼
        ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼♠☼ ☼ ☼
        ☼  # # #      #       ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼  #  ## #    #       ☼
        ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼###    &        & # #☼
        ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼ ☼
        ☼    #         # ##   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼  # 3 ♥         #    ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼
        ☼            &        ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'DOWN');
    });
    it('should det way from bomb even more', () => {
        checkBoard(`
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
    ☼         #      ♥    ☼
    ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼☻☼ ☼ ☼
    ☼          #    #    #☼
    ☼ ☼#☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
    ☼ # #           &     ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼ #      # #  #  #    ☼
    ☼ ☼#☼ ☼ ☼♥☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼ & #   3 #     #     ☼
    ☼#☼ ☼ ☼#☼#☼ ☼#☼#☼ ☼ ☼ ☼
    ☼       ♥   #         ☼
    ☼#☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼#☼ ☼
    ☼   #       # # ###   ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼ #   #  ##          #☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼
    ☼                     ☼
    ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼    &   ###  #   #   ☼
    ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼#   &    #    #♠## # ☼
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'DOWN');
    });

    it('should det way from bomb even more', () => {
        checkBoard(`
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
    ☼  #           &  # # ☼
    ☼#☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
    ☼    #        #     # ☼
    ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼  #       & #        ☼
    ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼# #          # ##    ☼
    ☼ ☼ ☼#☼ ☼☺☼ ☼ ☼ ☼ ☼#☼ ☼
    ☼#      #3   ♥        ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼#☼
    ☼## #  ##   #    #   ♠☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
    ☼                #  # ☼
    ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼
    ☼  #     #   ##       ☼
    ☼#☼♥☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼#☼
    ☼   #& #  # #         ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼
    ☼       #          # &☼
    ☼ ☼#☼ ☼ ☼#☼ ☼♥☼ ☼ ☼ ☼ ☼
    ☼      #              ☼
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'UP');
    });

    it('should det way from bomb even more', () => {
        checkBoard(`
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
    ☼3♥    # #♥3   #      ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼#☼ ☼
    ☼      ##    #  #  ☺  ☼
    ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼3☼ ☼
    ☼  #     #     ##    #☼
    ☼ ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼       ###    #     #☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼#       #      #    #☼
    ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
    ☼   ##     # #     #  ☼
    ☼ ☼#☼#☼#☼ ☼ ☼#☼ ☼ ☼ ☼#☼
    ☼   # # &             ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼ #         # &    #  ☼
    ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼                     ☼
    ☼ ☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼ ☼ ☼ ☼
    ☼    #         #  ##  ☼
    ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼♥☼ ☼
    ☼    &#      ##    #  ☼
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'LEFT');
    });

    it('should det way from bomb even more', () => {
        checkBoard(`
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
    ☼         1           ☼
    ☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼     #   #        ## ☼
    ☼☺☼ ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼ ☼
    ☼҉                    ☼
    ☼҉☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼҉    # # # #         ☼
    ☼҉☼ ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
    ☼҉    ###    #       r☼
    ☼҉☼ ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
    ☼҉        #     #    #☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
    ☼            #    #&  ☼
    ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
    ☼      #    &         ☼
    ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼ ☼
    ☼     #   #        #  ☼
    ☼ ☼ ☼#☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼
    ☼ # #   #   ## ##   ##☼
    ☼#☼ ☼#☼ ☼ ☼ ☼#☼#☼ ☼#☼&☼
    ☼##    #&##         # ☼
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'UP');
    });

    describe('getPath', () => {
        it('Should able to build path', () => {


            const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼   #  &             ☺☼
        ☼ ☼#☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
        ☼  #                  ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼##    # #  #     #   ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼
        ☼  #   #     & ##     ☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#    #               ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼    &                ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼
        ☼     # #  ♥      #   ☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼## #           +##   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼#☼ ☼ ☼
        ☼#    #   #       #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼#☼ ☼#☼#☼ ☼
        ☼ #     #      #      ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


            const board = getBoard(bombBoard);

            const hero = board.getHero();
            assert.equal(hero.x, 21);
            assert.equal(hero.y, 1);

            const player = board.players[0];
            assert.equal(player.x, 11);
            assert.equal(player.y, 13);

            const path = getPaths(board, hero, new Point(player.x, player.y));

            assert.equal(path.length, 23);
        })
    });
});



