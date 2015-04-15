/**
 * Created by jiengfei on 15-3-24.
 */


"use strict";
var utils = require('./utils');
var Matrix = require('./Matrix');
var draw = function (dc) {
    dc.save();
    dc.translate(this.tx, this.ty);
    var mat = this.rMatrix;
    //utils.print("mat="+mat);
    dc.transform(mat.a, mat.c, mat.b, mat.d, mat.tx, mat.ty);
    this.drawable.draw(dc);
    dc.restore();
};

function AElement(drawable) {
    this.tx = this.ty = 0;
    this.rMatrix = Matrix.create();
    this.drawable = drawable;
    this.draw = draw;
};

var p = AElement.prototype;
p.rotate = function(angle) {
    var size = this.getSize();
    this.rMatrix.rotate(angle, size.width, size.height);
};
p.pivotRotate = function (angle, px, py) {
    var mat = this.rMatrix;
    mat.translate(px, py);
    mat.rotate(angle);
    mat.translate(-px, -py);
};
p.scale = function(sx, sy) {
    var mat = this.rMatrix;
    mat.scale(sx, sy);
};
p.pivotScale = function(sx, sy, px, py) {
    var mat = this.rMatrix;
    mat.translate(px, py);
    mat.scale(sx, sy);
    mat.translate(-px, -py);
};
p.translate = function (tx, ty) {
    this.tx += tx;
    this.ty += ty;
};
p.getSize = function () {
    return this.drawable.getSize();
};
p.getWidth = function () {
    return this.drawable.getWidth();
};
p.getHeight = function() {
    return this.drawable.getHeight();
};

p.move = p.translate;
p.draw = draw;

module.exports = AElement;


