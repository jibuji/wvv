"use strict";
var ADrawable = require('./ADrawable');

function GraphicsDrawable(w, h, drawFunc) {
    ADrawable.apply(this);
    var thisObj = this;
    var mat = require('./Matrix').create();
    this.draw = function (dc) {
        var sx = thisObj.sx;
        var sy = thisObj.sy;
        dc.scale(sx, sy);
        drawFunc(dc);
        dc.scale(1 / sx, 1 / sy);
    };
    this.width = w;
    this.height = h;
    return this;
};

GraphicsDrawable.prototype = Object.create(ADrawable.prototype);

module.exports = GraphicsDrawable;