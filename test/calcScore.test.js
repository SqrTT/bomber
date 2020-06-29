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

function checkBoard(board, answer, prepare) {
    const bombBoard = (board).replace(/\n +/ig, '');
    const b = getBoard(bombBoard);

    if (prepare) {
        prepare(b);
    }
    const res = calc({
        gameState: b
    })

    assert.equal(res, answer);
}

describe('score calc', function () {
    const board = (`
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
☼        & &          ☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼#☼
☼   ##  # # ##     #♥#☼
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
        const b = getBoard(board);
        const res = calc({
            gameState: b
        })

        assert.equal(res, 'RIGHT,ACT');
    });

    it('should see walls amount', function () {
        const res = calc({
            gameState: getBoard(board),
            action: 'RIGHT'
        })

        assert.equal(res, 'RIGHT,ACT');
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

        assert.equal(res, 'UP');
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
☼   # ☺2    &         ☼
☼♥☼ ☼i☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
☼     #  #   ##   ## #☼
☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
☼   &    #   ##       ☼
☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n/ig, '');

        const res = calc({
            gameState: getBoard(bombBoard),
        })

        assert.equal(res, 'LEFT,ACT');
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

        assert.equal(res, 'LEFT,ACT');
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

        const b = getBoard(bombBoard);

        b.hero.bombsCount = 0;

        const res = calc({
            gameState: b
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

        const boardd = getBoard(bombBoard);
        boardd.hero.bombsCount = 0;
        const res = calc({
            gameState: boardd
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
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'DOWN,ACT');
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
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'DOWN,ACT');
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
    ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`, 'RIGHT');
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


    it('Should avoid chopper', () => {


        const bombBoard = (`
            ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
            ☼#  i     #   #      #☼
            ☼#☼ ☼ ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼
            ☼   c      #   &###   ☼
            ☼#☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
            ☼         ##  #  #  # ☼
            ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
            ☼       #    #  ##    ☼
            ☼ ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
            ☼            #        ☼
            ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
            ☼### #         ♥#     ☼
            ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
            ☼          3☺ #2      ☼
            ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼
            ☼  #           #  #   ☼
            ☼#☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
            ☼#       # &       i  ☼
            ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
            ☼##         # ##      ☼
            ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼&☼ ☼
            ☼#       ##&          ☼
            ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'RIGHT');
        assert.notEqual(res, 'RIGHT,ACT');
        assert.notEqual(res, 'ACT,RIGHT');
    })



    it('Should avoid bobmbbb', () => {
        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼   #  ##  #    #  ###☼
        ☼ ☼#☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼         #&         #☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼
        ☼     #        #  #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   #                #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼    &♥  2 ☺          ☼
        ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼ ☼#☼#☼
        ☼҉҉҉҉҉҉H              ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼&            #    # #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼c☼ ☼#☼ ☼ ☼
        ☼   # # # #     # ##  ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼####  ###### # #  # #☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 2;

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'LEFT');
    })

    it('Should avoid bobmbbb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼#                ####☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼
        ☼# #              # # ☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼  c           ♠      ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼
        ☼             #    #  ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼
        ☼              ҉     #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼҉☼☺☼ ☼ ☼
        ☼              ҉     #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼҉☼ ☼ ☼#☼
        ☼            # ҉   #  ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼҉☼#☼ ☼#☼
        ☼          #   ҉ #    ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼&☼ ☼ ☼ ☼
        ☼ # #           #    #☼
        ☼ ☼#☼ ☼ ☼ ☼ ☼#☼#☼ ☼ ☼#☼
        ☼  #        #         ☼
        ☼ ☼#☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼#### # ##  #  #### # ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 1;

        const res = calc({
            gameState: board
        })

        assert.equal(res, 'DOWN,ACT');
    })



    it('Should avoid bobmbbb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼    &    #    #######☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼#☼
        ☼      #          # # ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼#         ♥ 2        ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼             #       ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼        &    # # #   ☼
        ☼#☼ ☼ ☼☺☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼        1            ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼                 #   ☼
        ☼#☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼# #                  ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼  #   #          ##  ☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼     #     &   ## #  ☼
        ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#### ### # ##  ### # ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 0;

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'DOWN');
    })
    it('Should avoid bobmbbb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼#  #                 ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼          #          ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼     #     ##    #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼#☼ ☼
        ☼        #            ☼
        ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼҉☼ ☼ ☼
        ☼#  #  #     ҉҉҉҉҉҉H##☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼♥☼ ☼҉☼ ☼ ☼
        ☼    #        ҉҉҉҉҉҉҉ ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼҉☼ ☼ ☼
        ☼                ҉ #  ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼҉☼#☼ ☼
        ☼                ☺&   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼              #   &  ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   #   ##  # # # #   ☼
        ☼#☼ ☼#☼#☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼## ##### # #   ### # ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 0;

        const res = calc({
            gameState: board
        })

        assert.equal(res, 'DOWN');
    })



    it('Should avoid bobmbbb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼                ##   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼  #                  ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼
        ☼        x     #   #  ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼&        2           ☼
        ☼#☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼ ☼ ☼ ☼
        ☼#  #             #   ☼
        ☼#☼1☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#☺            #      ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼                #    ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼
        ☼            # #  ## #☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#             &      ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼ ### # # ##   # #    ☼
        ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#   ######       ### ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 0;

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'RIGHT');
    })


    it('Should avoid bobmbbb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼    # #       ☺     #☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼ #                 # ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼ # #         ♥1      ☼
        ☼&☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼##  #         &  #   ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼#  #                 ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   #                 ☼
        ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼                  ## ☼
        ☼#☼&☼&☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼#    # #  #  # ## # #☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼#☼ ☼#☼#☼ ☼
        ☼#             ####   ☼
        ☼&☼ ☼ ☼ ☼ ☼ ☼#☼#☼#☼ ☼#☼
        ☼ # # # # # #     # ##☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 0;

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'DOWN');
    })

    it('Should not stick to enemy under bomb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼ #   #1  ♥2     #    ☼
        ☼ ☼ ☼ ☼ ☼♥☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼        ☺ 2        ##☼
        ☼ ☼ ☼ ☼ ☼ ☼♥☼#☼ ☼#☼#☼ ☼
        ☼ #        1       #  ☼
        ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼
        ☼   #   ♥3 # #      # ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼                   # ☼
        ☼ ☼ ☼ ☼&☼ ☼ ☼#☼ ☼ ☼ ☼ ☼
        ☼     #               ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼  # #                ☼
        ☼ ☼ ☼#☼ ☼ ☼#☼ ☼ ☼ ☼ ☼#☼
        ☼# & ##               ☼
        ☼ ☼ ☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   # ##  #     &     ☼
        ☼#☼#☼ ☼ ☼ ☼ ☼#☼ ☼ ☼ ☼#☼
        ☼    # ##    # &     #☼
        ☼#☼#☼ ☼ ☼#☼#☼#☼ ☼ ☼#☼ ☼
        ☼  #         ##&   #  ☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 1;

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'DOWN');
    })




    it('Should avoid bobmbbb', () => {

        const bombBoard = (`
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼
        ☼      ♠          #  #☼
        ☼ ☼ ☼#☼#☼ ☼ ☼ ☼ ☼#☼ ☼ ☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼  & #        ♥       ☼
        ☼ ☼#☼#☼ ☼ ☼ ☼ ☼2☼ ☼ ☼#☼
        ☼  & #       2 ♥3♥    ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼
        ☼                     ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼
        ☼            ☺      # ☼
        ☼#☼ ☼#☼#☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   #  # & # 2   #    ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼
        ☼   ##                ☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼ ☼
        ☼       # # #       # ☼
        ☼ ☼#☼ ☼ ☼ ☼#☼ ☼#☼#☼ ☼#☼
        ☼ ####         &   ###☼
        ☼ ☼ ☼ ☼ ☼ ☼ ☼ ☼#☼#☼ ☼#☼
        ☼ ##        # # ### ##☼
        ☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼☼`).replace(/\n +/ig, '');


        const board = getBoard(bombBoard);

        board.hero.bombsCount = 0;

        const res = calc({
            gameState: board
        })

        assert.notEqual(res, 'UP');
        assert.notEqual(res, 'DOWN');
    })




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



