/**
 * Created by jiengfei on 15-3-24.
 */

"use strict";
var utils = require('./utils');
var Matrix2D = require('./Matrix2D');
var wvv = require('./wvv');
var draw = function (dc) {
    dc.save();
    var mat = this.matrix;
    //utils.print("mat="+mat);
    dc.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
    this.drawable.draw(dc);
    dc.restore();
};

function Element(drawable) {
    this.tx = this.ty = 0;
    this.matrix = new Matrix2D();
    this.drawable = drawable;
    this.draw = draw;
    this.r = 0;
    this.rpx = this.rpy = this.spx = this.spy = -1;
    this.sx = this.sy = 1;
    var buildMatrix = function (e) {
        console.trace();
        var matrix = e.matrix;
        matrix.identify();
        var size = e.getSize();
        var cx = size.width / 2;
        var cy = size.height / 2;

        var spx = e.spx > 0 ? e.spx : 0;
        var spy = e.spy > 0 ? e.spy : 0;
        var rpx = e.rpx > 0 ? e.rpx : cx;
        var rpy = e.rpy > 0 ? e.rpy : cy;

        //matrix.translate(e.tx + rpx, e.tx + rpy);
        //matrix.rotate(e.r);
        //matrix.translate(-rpx, -rpy);
        matrix.translate(e.tx + rpx, e.ty + rpy);
        matrix.rotate(e.r);
        matrix.translate(spx - rpx, spy - rpy);
        matrix.scale(e.sx, e.sy);
        matrix.translate(- spx, - spy);
    };
    this.delayBuildMatrixFunc = utils.oncePoster(buildMatrix, function (f) {
        wvv.post(f);
    });
};

var p = Element.prototype;
p.rotate = function (angle) {
    this.r = angle;
    this.rpx = this.rpy = -1;
    this.delayBuildMatrixFunc(this);
};

p.pivotRotate = function (angle, px, py) {
    this.r = angle;
    this.rpx = px;
    this.rpy = py;
    this.delayBuildMatrixFunc(this);
};

p.scale = function (sx, sy) {
    this.sx = sx;
    this.sy = sy;
    this.spx = this.spy = -1;
    this.delayBuildMatrixFunc(this);
};

p.pivotScale = function (sx, sy, px, py) {
    this.sx = sx;
    this.sy = sy;
    this.spx = px;
    this.spy = py;
    this.delayBuildMatrixFunc(this);
};

p.setTranslate = function (tx, ty) {
    this.tx = tx;
    this.ty = ty;
    this.delayBuildMatrixFunc(this);
};

p.getSize = function () {
    return this.drawable.getSize();
};

p.getWidth = function () {
    return this.drawable.getWidth();
};

p.getHeight = function () {
    return this.drawable.getHeight();
};

p.move = function(tx, ty) {
    this.tx += tx;
    this.ty += ty;
    this.delayBuildMatrixFunc(this);
};

p.draw = draw;

module.exports = Element;


