/**
 * Created by jiengfei on 15-3-23.
 */
(function () {
    "use strict";
    var devEnv = require('./CONFIG').DEV;
    var wvv = {
    };

    var _layers = [];
    var LAYER_ID_INDEX = 0;
    var STAGE_ID_INDEX = 1;
    var CANVAS_INDEX = 2;
    var DC_INDEX = 3;
    var FLAGS_INDEX = 4;
    var DIRTY_FLAG = 1;

    var defaultFlags = DIRTY_FLAG;

    function _delegateTouchEventToStage(canvas, stage) {
        //canvas.addEventListener("");
    }

    wvv.setStage = function (layerId, stage) {
        var canvas = document.getElementById(layerId);
        var dc = canvas.getContext('2d');
        _delegateTouchEventToStage(canvas, stage);
        _layers.push([layerId, stage, canvas, dc, defaultFlags]);
    };

    var callbacks = [];
    wvv.post = function(cb) {
        callbacks.push(cb);
    };

    var _handleCallbacks = function() {
        for (var i = 0, length = callbacks.length; i < length; ++i) {
            callbacks[i]();
        }
    };

    var _render = function() {
        var layer;
        for (var i = 0, length = _layers.length; i < length; ++i) {
            layer = _layers[i];
            var flags = layer[FLAGS_INDEX];
            if ((flags & DIRTY_FLAG) != 0) {
                layer[STAGE_ID_INDEX].draw(layer[DC_INDEX]);
            }
        }
    };

    wvv.gameLoop = function() {
        (function _loop() {
            _handleCallbacks();
            console.log("rendering");
            _render();
            if (devEnv) {
                window.setTimeout(_loop, 10000);
            } else {
                window.requestAnimationFrame(_loop, null);
            }
        }());
    };

    module.exports = wvv;

}());