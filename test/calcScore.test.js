const assert = require('assert');
const { Board } = require('../src/Board');
const { calc } = require('../src/calculateScore');

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
            board,
            action: 'LEFT',
            bombsCount: 0
        })

        assert.equal(res, 8);
    });

    it('should see walls amount', function () {
        const res = calc({
            board,
            action: 'RIGHT',
            bombsCount: 0
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
            board: bombBoard,
            action: 'LEFT',
            bombsCount: 0
        })

        assert(res < 0, 'avoid bomb');

        const res2 = calc({
            board: bombBoard,
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
            board: bombBoard,
            action: 'STOP',
            bombsCount: 0
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
            board: bombBoard,
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
            board: bombBoard,
            action: 'RIGHT',
            bombsCount: 0
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
            board: bombBoard,
            action: 'DOWN',
            bombsCount: 0
        })

        assert.ok(res < 0);

    });
});
