/**
 * Created by jiengfei on 15-4-22.
 */
var utils = require('./utils');

var doMouseDown = function(stage, event) {
    console.log("mouse down event="+event);
};

var doMouseMove = function(stage, event) {
    console.log("mouse move event="+event);
};

var doMouseUp = function(stage, event) {
    console.log("mouse up event="+event);
};

var registerOnCanvas = function(canvas, stage) {
    canvas.addEventListener("mousedown", utils.partial(doMouseDown, stage), false);
    canvas.addEventListener("mousemove", utils.partial(doMouseMove, stage), false);
    canvas.addEventListener("mouseup", utils.partial(doMouseUp, stage), false);
};

module.exports = {
    'registerOnCanvas' : registerOnCanvas
};