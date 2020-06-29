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
function onBoardData(data) {
    $('body').trigger('board-updated', data);
}

function initCanvas() {
    var canvas = null;
    var plots = {};
    var plotsUrls = {};
    var plotSize = 0;
    var canvasSize = 0;
    var images = {};
    var boardSize = 23;
    var isDrawByOrder = true;

    var elements = Element;
    var spriteElements = ["bomberman", "bomb_bomberman", "dead_bomberman", "other_bomberman", "other_bomb_bomberman", "other_dead_bomberman", "bomb_timer_5", "bomb_timer_4", "bomb_timer_3", "bomb_timer_2", "bomb_timer_1", "boom", "wall", "destroyable_wall", "destroyed_wall", "meat_chopper", "dead_meat_chopper", "bomb_blast_radius_increase", "bomb_count_increase", "bomb_remote_control", "bomb_immune", "none"];
    var alphabet = '☺☻Ѡ♥♠♣54321҉☼#H&x+cri ';

    loadCanvasData(alphabet, spriteElements);

    function loadSpriteImages(elements, alphabet, onImageLoad) {
        for (var index in elements) {
            var ch = alphabet[index];
            var color = elements[index];
            plots[ch] = color;
            plotsUrls[color] = 'sprites/' + color + '.png';

            var image = new Image();
            image.onload = function () {
                if (plotSize == 0) {
                    plotSize = this.width;
                    canvasSize = plotSize * boardSize;
                    if (!!onImageLoad) {
                        onImageLoad();
                    }
                }
            }
            image.src = plotsUrls[color];
            images[color] = image;
        }
    }

    function loadCanvasData(alphabet, elements) {
        loadSpriteImages(elements, alphabet, function () {
            var canvas = createCanvas('board-canvas');

            $('body').on('board-updated', function (events, { data, extraData }) {
                canvas.boardSize = data.split('\n')[0].length;
                drawBoard(getBoardDrawer(canvas, data.split('\n').join(''), extraData));
            });
        });
    }

    function decode(ch) {
        return plots[ch];
    }

    function plotsContains(color) {
        for (var ch in plots) {
            if (plots[ch] == color) {
                return true;
            }
        }
        return false;
    }

    /** */
    var getBoardDrawer = function (canvas, boardData, extraData) {
        var drawAllLayers = function (layers, onDrawItem) {
            var drawChar = function (plotIndex) {
                var x = 0;
                var y = boardSize - 1;
                for (var charIndex = 0; charIndex < layers[0].length; charIndex++) {
                    for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
                        var layer = layers[layerIndex];
                        var color = layer[charIndex];
                        if (!isDrawByOrder || plotIndex == color) {
                            canvas.drawPlot(decode(color), x, y);
                            if (!!onDrawItem) {
                                onDrawItem(layers, layerIndex, charIndex, x, y);
                            }
                        }
                    }
                    x++;
                    if (x == boardSize) {
                        x = 0;
                        y--;
                    }
                }
            }

            if (isDrawByOrder) {
                for (var ch in plots) {
                    var plot = plots[ch];
                    drawChar(ch);
                }
            } else {
                drawChar();
            }
        }

        var drawBackground = function (name) {
            if (plotsContains(name)) {
                var x = boardSize / 2 - 0.5;
                canvas.drawPlot(name, x, 0);
            }
        }

        var drawBack = function () {
            drawBackground('background');
        }

        var drawFog = function () {
            drawBackground('fog');
        }

        var clear = function () {
            canvas.clear();
        }

        var drawLayers = function (onDrawItem) {
            var toDraw = (!boardData.layers) ? [boardData] : boardData.layers;
            try {
                drawAllLayers(toDraw, onDrawItem);
            } catch (err) {
                console.log(err);
            }
        }

        function drawScores() {
            var { scores } = extraData;
            if (scores) {
                scores.forEach((row, y) => {
                    row.forEach((cel, x) => {
                        if (cel != 0 && cel > -110)
                            canvas.drawText(cel, x, y);
                    })
                })
            }
        }

        function drawRoute() {
            var { nextPath } = extraData;
            if (nextPath) {
                nextPath.forEach(([x, y]) => {
                    canvas.drawRec(x, y);
                })
            }
        }

        return {
            clear: clear,
            drawBack: drawBack,
            drawLayers: drawLayers,
            drawFog: drawFog,
            canvas: canvas,
            boardData: boardData,
            drawScores: drawScores,
            drawRoute: drawRoute
        };
    };

    var drawBoard = function defaultDrawBoard(drawer) {
        drawer.clear();
        drawer.drawBack();
        drawer.drawLayers();
        drawer.drawFog();
        drawer.drawScores();
        drawer.drawRoute();
    }

    function createCanvas(canvasName) {
        var canvas = $("#" + canvasName);

        if (canvas[0].width != canvasSize || canvas[0].height != canvasSize) {
            canvas[0].width = canvasSize;
            canvas[0].height = canvasSize;
        }

        var drawPlot = function (color, x, y) {
            var image = images[color];
            drawImage(image, x, y, 0, 0);
        }

        var drawImage = function (image, x, y, dx, dy) {
            var ctx = canvas[0].getContext("2d");
            ctx.drawImage(
                image,
                x * plotSize - (image.width - plotSize) / 2 + dx,
                (boardSize - 1 - y) * plotSize - (image.height - plotSize) + dy
            );
        };

        function drawRec(x, y) {
            /**
             * @type {HTMLCanvasElement}
             */
            var canv = canvas.get(0);
            var ctx = canv.getContext("2d");

            /// lets save current state as we make a lot of changes
            ctx.save();
            ctx.fillStyle = "blue";
            ctx.globalAlpha = 0.4;
            ctx.fillRect(x * plotSize, y * plotSize,  10, 10);
            ctx.globalAlpha = 1.0;

            /// restore original state
            ctx.restore();
        }

        function drawTextBG(ctx, txt, font, x, y) {

            /// lets save current state as we make a lot of changes
            ctx.save();

            /// set font
            ctx.font = font;

            /// draw text from top - makes life easier at the moment
            ctx.textBaseline = 'top';

            /// color for background
            ctx.fillStyle = '#fff';

            /// get width of text
            var width = ctx.measureText(txt).width;

            /// draw background rect assuming height of font
            ctx.fillRect(x, y, width, parseInt(font, 10));

            /// text color
            ctx.fillStyle = '#000';

            /// draw text on top
            ctx.fillText(txt, x, y);

            /// restore original state
            ctx.restore();
        }

        var drawText = function (text, x, y) {
            /**
             * @type {HTMLCanvasElement}
             */
            var canv = canvas.get(0);
            var ctx = canv.getContext("2d");

            drawTextBG(ctx, text, 10, x * plotSize + (plotSize / String(text).length) - 5, (y) * plotSize + 5)
        }

        var clear = function () {
            // canvas.clearCanvas();
        }

        var getCanvasSize = function () {
            return canvasSize;
        }

        var getPlotSize = function () {
            return plotSize;
        }

        return {
            drawImage: drawImage,
            drawPlot: drawPlot,
            clear: clear,
            getCanvasSize: getCanvasSize,
            getPlotSize: getPlotSize,
            drawText: drawText,
            drawRec: drawRec
        };
    }
}

initCanvas();
