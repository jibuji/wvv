"use strict";
var ADrawable = require('./ADrawable');

function GraphicsDrawable(w, h, drawFunc) {
    ADrawable.apply(this);
    var thisObj = this;
    var mat = require('./Matrix').create();
    this.draw = function (dc) {
        var sx = thisObj.sx;
        var sy = thisObj.sy;
        //dc.scale(sx, sy);
        var cx = w /2;
        var cy = h /2;
        mat.identify();

        mat.translate(cx, cy); // translate to rectangle center
        // x = x + 0.5 * width
        // y = y + 0.5 * height
        mat.rotate((Math.PI/180)*90); // rotate
        mat.translate(-cx, -cy); // translate back
        dc.transform(mat.a, mat.c, mat.b, mat.d, mat.tx, mat.ty);
        drawFunc(dc);
        //dc.scale(1 / sx, 1 / sy);
    };
    this.width = w;
    this.height = h;
    return this;
};

GraphicsDrawable.prototype = Object.create(ADrawable.prototype);

module.exports = GraphicsDrawable;