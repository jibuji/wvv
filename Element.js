/**
 * Created by jiengfei on 15-3-24.
 */

"use strict";
var utils = require('./utils');
var Matrix = require('./Matrix');
var wvv = require('./wvv');
var draw = function (dc) {
    dc.save();
    var mat = this.rMatrix;
    //utils.print("mat="+mat);
    dc.transform(mat.a, mat.c, mat.b, mat.d, mat.tx, mat.ty);
    this.drawable.draw(dc);
    dc.restore();
};

function Element(drawable) {
    this.tx = this.ty = 0;
    this.rMatrix = Matrix.create();
    this.drawable = drawable;
    this.draw = draw;
    this.rotationAngle = 0;
    this.rotationPivotX = this.rotationPivotY = this.scalePivotX = this.scalePivotY = -1;
    this.scaleX = this.scaleY = 1;
    var buildMatrix = function (e) {
        var matrix = e.rMatrix;
        matrix.identify();
        matrix.translate(e.scalePivotX, e.scalePivotY);
        matrix.scale(e.scaleX, e.scaleY);
        matrix.translate(e.rotationPivotX - e.scalePivotX, e.rotationPivotY - e.scalePivotY);
        matrix.rotate(e.rotationAngle);
        matrix.translate(e.tx - e.rotationPivotX, e.ty - e.rotationPivotY);
    };
    this.delayBuildMatrixFunc = utils.oncePoster(buildMatrix, function (f) {
        wvv.post(f);
    }, this);
};

var p = Element.prototype;
p.rotate = function (angle) {
    this.rotationAngle = angle;
    this.rotationPivotX = this.rotationPivotY = -1;
    this.delayBuildMatrixFunc();
};

p.pivotRotate = function (angle, px, py) {
    this.rotationAngle = angle;
    this.rotationPivotX = px;
    this.rotationPivotY = py;
    this.delayBuildMatrixFunc();
};

p.scale = function (sx, sy) {
    this.scaleX = sx;
    this.scaleY = sy;
    this.scalePivotX = this.scalePivotY = -1;
    this.delayBuildMatrixFunc();
};

p.pivotScale = function (sx, sy, px, py) {
    this.scaleX = sx;
    this.scaleY = sy;
    this.scalePivotX = px;
    this.scalePivotY = py;
    this.delayBuildMatrixFunc();
};

p.setTranslate = function (tx, ty) {
    this.tx = tx;
    this.ty = ty;
    this.delayBuildMatrixFunc();
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
    this.delayBuildMatrixFunc();
};

p.draw = draw;

module.exports = Element;


