(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by jiengfei on 15-4-13.
 */
/**
 * */
'use strict';
var utils = require('./utils');
var EmptyFunc = utils.EmptyFunction;

function ADrawable() {
    this.width = this.height = 0;
    this.sx = this.sy = 1;
};

var p = ADrawable.prototype;
p.scale = function (scaleX, scaleY) {
    this.sx *= scaleX;
    this.sy *= scaleY;
};
p.getSize = function () {
    return {
        width: this.width,
        height: this.height
    };
};
p.getWidth = function () {
    return this.width;
};
p.getHeight = function () {
    return this.height;
};
p.draw = EmptyFunc;

module.exports = ADrawable;
},{"./utils":11}],2:[function(require,module,exports){
/**
 * Created by jiengfei on 15-3-24.
 */
var CONFIG = {
    DEV: false
};

module.exports = CONFIG;
},{}],3:[function(require,module,exports){
/**
 * Created by jiengfei on 15-4-10.
 */

'use strict';
var asserts = require('./utils').assert;
var GraphicsDrawable = require('./GraphicsDrawable');

function DrawRecorder() {
    var cmds = this.cmds = [];
    this.path2D = null;

    this.beginPath = function () {
        asserts(!this.path2D, "this.path2D=%s", this.path2D)
        this.path2D = new Path2D();
        return this;
    };

    this.rect = function (x, y, w, h) {
        this.path2D.rect(x, y, w, h);
        return this;
    };

    this.closePath = function () {
        this.path2D.closePath();
        return this;
    };

    this.stroke = function () {
        var path2d = this.path2D;
        path2d.closePath();
        this.cmds.push(function (dc) {
            dc.stroke(path2d);
        });
        this.path2D = null;
        return this;
    };

    this.fill = function () {
        var path2d = this.path2D;
        path2d.closePath();
        this.cmds.push(function (dc) {
            dc.fill(path2d);
        });
        this.path2D = null;
        return this;
    };

    var replay = this.replay = function (dc) {
        for (var i = 0, length = cmds.length; i < length; ++i) {
            cmds[i](dc);
        }
    };

    this.drawable = function (w, h) {
        return new GraphicsDrawable(w, h, function (dc) {
            replay(dc);
        });
    };
};

module.exports = DrawRecorder;


},{"./GraphicsDrawable":5,"./utils":11}],4:[function(require,module,exports){
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
    dc.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
    this.drawable.draw(dc);
    dc.restore();
};

function Element(drawable) {
    this.tx = this.ty = 0;
    this.rMatrix = Matrix.create();
    this.drawable = drawable;
    this.draw = draw;
    this.r = 0;
    this.rpx = this.rpy = this.spx = this.spy = -1;
    this.sx = this.sy = 1;
    var buildMatrix = function (e) {
        var matrix = e.rMatrix;
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
    }, this);
};

var p = Element.prototype;
p.rotate = function (angle) {
    this.r = angle;
    this.rpx = this.rpy = -1;
    this.delayBuildMatrixFunc();
};

p.pivotRotate = function (angle, px, py) {
    this.r = angle;
    this.rpx = px;
    this.rpy = py;
    this.delayBuildMatrixFunc();
};

p.scale = function (sx, sy) {
    this.sx = sx;
    this.sy = sy;
    this.spx = this.spy = -1;
    this.delayBuildMatrixFunc();
};

p.pivotScale = function (sx, sy, px, py) {
    this.sx = sx;
    this.sy = sy;
    this.spx = px;
    this.spy = py;
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



},{"./Matrix":7,"./utils":11,"./wvv":12}],5:[function(require,module,exports){
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
},{"./ADrawable":1,"./Matrix":7}],6:[function(require,module,exports){
/**
 * Group can position elements to Stage.
 * CAUTION: You shouldn't call *addElement* or *addGroup* after *move*.
 * */

var assert = require('./utils').assert;
var forEach = Array.prototype.forEach;

function Group() {
    this.members = [];
    this.tx = this.ty = 0;
    this.width = this.height = 0;
};

Group.prototype.add = function (e) {
    assert(!this._frozen, "You can't addElements after move.");
    assert(!e.ctx, "this element (%s) has been added to Stage already.", e);
    e.move(this.tx, this.ty);
    e.ctx = this.ctx;
    var size = e.getSize();
    this.tx += size.width;
    this.members.push(e);
    return this;
};

//(member*)
var _addElements = function () {
    assert(!this._frozen, "You can't addElements after move.");
    var assignCtx = function (e) {
        assert(!e.ctx, "this element (%s) has been added to Stage already.", e);
        e.move(this.tx, this.ty);
        e.ctx = this.ctx;
    };

    forEach.apply(arguments, assignCtx);
    //arguments.forEach(assignCtx);
    this.members.concat(arguments);
};

//(Group)
Group.prototype.addGroup = function (group) {
    assert(group instanceof Group, "group (%s) isn't Group.", group);
    _addElements.call(this, group.members);
};

//(member*)
Group.prototype.addElements = _addElements;

Group.prototype.remove = function () {
    //TODO
};

var translate = Group.prototype.translate = function (x, y) {
    this.tx += x;
    this.ty += y;
    return this;
};

Group.prototype.resetTranslation = function (x, y) {
    this.tx = x;
    this.ty = y;
};

Group.prototype.move = function (x, y) {
    this._frozen = true;
    var assignCtx = function (e) {
        e.move(x, y);
    };
    this.members.forEach(assignCtx);
};

Group.prototype.skipH = function (span) {
    this.translate(span, 0);
    return this;
};

Group.prototype.skipV = function (span) {
    this.translate(0, span);
    return this;
};

Group.prototype.nextLine = function () {
    this.tx = 0;
    var members = this.members;
    var e = members[members.length - 1];
    this.ty += e.getSize().height;
    return this;
};

module.exports = Group;
},{"./utils":11}],7:[function(require,module,exports){
/*
 * Matrix2D
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module EaselJS
 */

// namespace:


// constructor:
/**
 * Represents an affine transformation matrix, and provides tools for constructing and concatenating matrices.
 *
 * This matrix can be visualized as:
 *
 *    [ a  c  tx
 *      b  d  ty
 *      0  0  1  ]
 *
 * Note the locations of b and c.
 *
 * @class Matrix2D
 * @param {Number} [a=1] Specifies the a property for the new matrix.
 * @param {Number} [b=0] Specifies the b property for the new matrix.
 * @param {Number} [c=0] Specifies the c property for the new matrix.
 * @param {Number} [d=1] Specifies the d property for the new matrix.
 * @param {Number} [tx=0] Specifies the tx property for the new matrix.
 * @param {Number} [ty=0] Specifies the ty property for the new matrix.
 * @constructor
 **/
function Matrix2D(a, b, c, d, tx, ty) {
    this.setValues(a, b, c, d, tx, ty);

    // public properties:
    // assigned in the setValues method.
    /**
     * Position (0, 0) in a 3x3 affine transformation matrix.
     * @property a
     * @type Number
     **/

    /**
     * Position (0, 1) in a 3x3 affine transformation matrix.
     * @property b
     * @type Number
     **/

    /**
     * Position (1, 0) in a 3x3 affine transformation matrix.
     * @property c
     * @type Number
     **/

    /**
     * Position (1, 1) in a 3x3 affine transformation matrix.
     * @property d
     * @type Number
     **/

    /**
     * Position (2, 0) in a 3x3 affine transformation matrix.
     * @property tx
     * @type Number
     **/

    /**
     * Position (2, 1) in a 3x3 affine transformation matrix.
     * @property ty
     * @type Number
     **/
}
var p = Matrix2D.prototype;

/**
 * <strong>REMOVED</strong>. Removed in favor of using `MySuperClass_constructor`.
 * See {{#crossLink "Utility Methods/extend"}}{{/crossLink}} and {{#crossLink "Utility Methods/promote"}}{{/crossLink}}
 * for details.
 *
 * There is an inheritance tutorial distributed with EaselJS in /tutorials/Inheritance.
 *
 * @method initialize
 * @protected
 * @deprecated
 */
// p.initialize = function() {}; // searchable for devs wondering where it is.


// constants:
/**
 * Multiplier for converting degrees to radians. Used internally by Matrix2D.
 * @property DEG_TO_RAD
 * @static
 * @final
 * @type Number
 * @readonly
 **/
Matrix2D.DEG_TO_RAD = Math.PI / 180;


// static public properties:
/**
 * An identity matrix, representing a null transformation.
 * @property identity
 * @static
 * @type Matrix2D
 * @readonly
 **/
Matrix2D.identity = null; // set at bottom of class definition.


// public methods:
/**
 * Sets the specified values on this instance.
 * @method setValues
 * @param {Number} [a=1] Specifies the a property for the new matrix.
 * @param {Number} [b=0] Specifies the b property for the new matrix.
 * @param {Number} [c=0] Specifies the c property for the new matrix.
 * @param {Number} [d=1] Specifies the d property for the new matrix.
 * @param {Number} [tx=0] Specifies the tx property for the new matrix.
 * @param {Number} [ty=0] Specifies the ty property for the new matrix.
 * @return {Matrix2D} This instance. Useful for chaining method calls.
 */
p.setValues = function (a, b, c, d, tx, ty) {
    // don't forget to update docs in the constructor if these change:
    this.a = (a == null) ? 1 : a;
    this.b = b || 0;
    this.c = c || 0;
    this.d = (d == null) ? 1 : d;
    this.tx = tx || 0;
    this.ty = ty || 0;
    return this;
};

/**
 * Appends the specified matrix properties to this matrix. All parameters are required.
 * This is the equivalent of multiplying `(this matrix) * (specified matrix)`.
 * @method append
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.append = function (a, b, c, d, tx, ty) {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    if (a != 1 || b != 0 || c != 0 || d != 1) {
        this.a = a1 * a + c1 * b;
        this.b = b1 * a + d1 * b;
        this.c = a1 * c + c1 * d;
        this.d = b1 * c + d1 * d;
    }
    this.tx = a1 * tx + c1 * ty + this.tx;
    this.ty = b1 * tx + d1 * ty + this.ty;
    return this;
};

/**
 * Prepends the specified matrix properties to this matrix.
 * This is the equivalent of multiplying `(specified matrix) * (this matrix)`.
 * All parameters are required.
 * @method prepend
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.prepend = function (a, b, c, d, tx, ty) {
    var a1 = this.a;
    var c1 = this.c;
    var tx1 = this.tx;

    this.a = a * a1 + c * this.b;
    this.b = b * a1 + d * this.b;
    this.c = a * c1 + c * this.d;
    this.d = b * c1 + d * this.d;
    this.tx = a * tx1 + c * this.ty + tx;
    this.ty = b * tx1 + d * this.ty + ty;
    return this;
};

/**
 * Appends the specified matrix to this matrix.
 * This is the equivalent of multiplying `(this matrix) * (specified matrix)`.
 * @method appendMatrix
 * @param {Matrix2D} matrix
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.appendMatrix = function (matrix) {
    return this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
};

/**
 * Prepends the specified matrix to this matrix.
 * This is the equivalent of multiplying `(specified matrix) * (this matrix)`.
 * For example, you could calculate the combined transformation for a child object using:
 *
 *    var o = myDisplayObject;
 *    var mtx = o.getMatrix();
 *    while (o = o.parent) {
	 * 		// prepend each parent's transformation in turn:
	 * 		o.prependMatrix(o.getMatrix());
	 * 	}
 * @method prependMatrix
 * @param {Matrix2D} matrix
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.prependMatrix = function (matrix) {
    return this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
};

/**
 * Generates matrix properties from the specified display object transform properties, and appends them to this matrix.
 * For example, you can use this to generate a matrix representing the transformations of a display object:
 *
 *    var mtx = new Matrix2D();
 *    mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
 * @method appendTransform
 * @param {Number} x
 * @param {Number} y
 * @param {Number} scaleX
 * @param {Number} scaleY
 * @param {Number} rotation
 * @param {Number} skewX
 * @param {Number} skewY
 * @param {Number} regX Optional.
 * @param {Number} regY Optional.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
    if (rotation % 360) {
        var r = rotation * Matrix2D.DEG_TO_RAD;
        var cos = Math.cos(r);
        var sin = Math.sin(r);
    } else {
        cos = 1;
        sin = 0;
    }

    if (skewX || skewY) {
        // TODO: can this be combined into a single append operation?
        skewX *= Matrix2D.DEG_TO_RAD;
        skewY *= Matrix2D.DEG_TO_RAD;
        this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
        this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
    } else {
        this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
    }

    if (regX || regY) {
        // append the registration offset:
        this.tx -= regX * this.a + regY * this.c;
        this.ty -= regX * this.b + regY * this.d;
    }
    return this;
};

/**
 * Generates matrix properties from the specified display object transform properties, and prepends them to this matrix.
 * For example, you could calculate the combined transformation for a child object using:
 *
 *    var o = myDisplayObject;
 *    var mtx = new createjs.Matrix2D();
 *    do  {
	 * 		// prepend each parent's transformation in turn:
	 * 		mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY);
	 * 	} while (o = o.parent);
 *
 *    Note that the above example would not account for {{#crossLink "DisplayObject/transformMatrix:property"}}{{/crossLink}}
 *    values. See {{#crossLink "Matrix2D/prependMatrix"}}{{/crossLink}} for an example that does.
 * @method prependTransform
 * @param {Number} x
 * @param {Number} y
 * @param {Number} scaleX
 * @param {Number} scaleY
 * @param {Number} rotation
 * @param {Number} skewX
 * @param {Number} skewY
 * @param {Number} regX Optional.
 * @param {Number} regY Optional.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
    if (rotation % 360) {
        var r = rotation * Matrix2D.DEG_TO_RAD;
        var cos = Math.cos(r);
        var sin = Math.sin(r);
    } else {
        cos = 1;
        sin = 0;
    }

    if (regX || regY) {
        // prepend the registration offset:
        this.tx -= regX;
        this.ty -= regY;
    }
    if (skewX || skewY) {
        // TODO: can this be combined into a single prepend operation?
        skewX *= Matrix2D.DEG_TO_RAD;
        skewY *= Matrix2D.DEG_TO_RAD;
        this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
        this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
    } else {
        this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
    }
    return this;
};

/**
 * Applies a clockwise rotation transformation to the matrix.
 * @method rotate
 * @param {Number} angle The angle to rotate by, in degrees. To use a value in radians, multiply it by `180/Math.PI`.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.rotate = function (angle) {
    angle = angle * Matrix2D.DEG_TO_RAD;
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    var a1 = this.a;
    var b1 = this.b;

    this.a = a1 * cos + this.c * sin;
    this.b = b1 * cos + this.d * sin;
    this.c = -a1 * sin + this.c * cos;
    this.d = -b1 * sin + this.d * cos;
    return this;
};

/**
 * Applies a skew transformation to the matrix.
 * @method skew
 * @param {Number} skewX The amount to skew horizontally in degrees. To use a value in radians, multiply it by `180/Math.PI`.
 * @param {Number} skewY The amount to skew vertically in degrees.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 */
p.skew = function (skewX, skewY) {
    skewX = skewX * Matrix2D.DEG_TO_RAD;
    skewY = skewY * Matrix2D.DEG_TO_RAD;
    this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
    return this;
};

/**
 * Applies a scale transformation to the matrix.
 * @method scale
 * @param {Number} x The amount to scale horizontally. E.G. a value of 2 will double the size in the X direction, and 0.5 will halve it.
 * @param {Number} y The amount to scale vertically.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.scale = function (x, y) {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    //this.tx *= x;
    //this.ty *= y;
    return this;
};

/**
 * Translates the matrix on the x and y axes.
 * @method translate
 * @param {Number} x
 * @param {Number} y
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.translate = function (x, y) {
    this.tx += this.a * x + this.c * y;
    this.ty += this.b * x + this.d * y;
    return this;
};

/**
 * Sets the properties of the matrix to those of an identity matrix (one that applies a null transformation).
 * @method identity
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.identity = function () {
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
    return this;
};

/**
 * Inverts the matrix, causing it to perform the opposite transformation.
 * @method invert
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 **/
p.invert = function () {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var n = a1 * d1 - b1 * c1;

    this.a = d1 / n;
    this.b = -b1 / n;
    this.c = -c1 / n;
    this.d = a1 / n;
    this.tx = (c1 * this.ty - d1 * tx1) / n;
    this.ty = -(a1 * this.ty - b1 * tx1) / n;
    return this;
};

/**
 * Returns true if the matrix is an identity matrix.
 * @method isIdentity
 * @return {Boolean}
 **/
p.isIdentity = function () {
    return this.tx === 0 && this.ty === 0 && this.a === 1 && this.b === 0 && this.c === 0 && this.d === 1;
};

p.identify = function() {
    this.tx = 0;
    this.ty = 0;
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
};
/**
 * Returns true if this matrix is equal to the specified matrix (all property values are equal).
 * @method equals
 * @param {Matrix2D} matrix The matrix to compare.
 * @return {Boolean}
 **/
p.equals = function (matrix) {
    return this.tx === matrix.tx && this.ty === matrix.ty && this.a === matrix.a && this.b === matrix.b && this.c === matrix.c && this.d === matrix.d;
};

/**
 * Transforms a point according to this matrix.
 * @method transformPoint
 * @param {Number} x The x component of the point to transform.
 * @param {Number} y The y component of the point to transform.
 * @param {Point | Object} [pt] An object to copy the result into. If omitted a generic object with x/y properties will be returned.
 * @return {Point} This matrix. Useful for chaining method calls.
 **/
p.transformPoint = function (x, y, pt) {
    pt = pt || {};
    pt.x = x * this.a + y * this.c + this.tx;
    pt.y = x * this.b + y * this.d + this.ty;
    return pt;
};

/**
 * Decomposes the matrix into transform properties (x, y, scaleX, scaleY, and rotation). Note that these values
 * may not match the transform properties you used to generate the matrix, though they will produce the same visual
 * results.
 * @method decompose
 * @param {Object} target The object to apply the transform properties to. If null, then a new object will be returned.
 * @return {Object} The target, or a new generic object with the transform properties applied.
 */
p.decompose = function (target) {
    // TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation even when scale is negative
    if (target == null) {
        target = {};
    }
    target.x = this.tx;
    target.y = this.ty;
    target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
    target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

    var skewX = Math.atan2(-this.c, this.d);
    var skewY = Math.atan2(this.b, this.a);

    var delta = Math.abs(1 - skewX / skewY);
    if (delta < 0.00001) { // effectively identical, can use rotation:
        target.rotation = skewY / Matrix2D.DEG_TO_RAD;
        if (this.a < 0 && this.d >= 0) {
            target.rotation += (target.rotation <= 0) ? 180 : -180;
        }
        target.skewX = target.skewY = 0;
    } else {
        target.skewX = skewX / Matrix2D.DEG_TO_RAD;
        target.skewY = skewY / Matrix2D.DEG_TO_RAD;
    }
    return target;
};

/**
 * Copies all properties from the specified matrix to this matrix.
 * @method copy
 * @param {Matrix2D} matrix The matrix to copy properties from.
 * @return {Matrix2D} This matrix. Useful for chaining method calls.
 */
p.copy = function (matrix) {
    return this.setValues(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
};

/**
 * Returns a clone of the Matrix2D instance.
 * @method clone
 * @return {Matrix2D} a clone of the Matrix2D instance.
 **/
p.clone = function () {
    return new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
};

/**
 * Returns a string representation of this object.
 * @method toString
 * @return {String} a string representation of the instance.
 **/
p.toString = function () {
    return "[Matrix2D (a=" + this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + ")]";
};

// this has to be populated after the class is defined:
Matrix2D.identity = new Matrix2D();


module.exports = {
    create: function () {
        return new Matrix2D();
    }
};
},{}],8:[function(require,module,exports){
/**
 * Created by jiengfei on 15-3-23.
 */
var assert = require('./utils').assert;
var Group = require('./Group');
var forEach = Array.prototype.forEach;
var slice = Array.prototype.slice;
var Stage = function () {
    this.tx = 0;
    this.ty = 0;
    this.width = this.height = 0;//will be initialized by wvv.
    this.elements = [];
};

Stage.prototype.setSize = function(w, h) {
    this.width = w;
    this.height = h;
};

Stage.prototype.draw = function (dc) {
    dc.clearRect(0, 0, this.width, this.height);
    for (var i = 0, length = this.elements.length; i < length; ++i) {
        var e = this.elements[i];
        e.draw(dc);
    }
};

//(member*)
var _addElements = function () {
    assert(!this._frozen, "You can't addElements after move.");
    var stageThis = this;
    var assignCtx = function (e) {
        assert(!e.ctx, "this element (%s) has been added to Stage already.", e);
        e.move(stageThis.tx, stageThis.ty);
        e.ctx = stageThis.ctx;
    };
    var argArray = slice.call(arguments);
    forEach.call(argArray, assignCtx);
    //arguments.forEach(assignCtx);
    this.elements = this.elements.concat(argArray);
};

//(Group)
Stage.prototype.addGroup = function (group) {
    assert(group instanceof Group, "group (%s) isn't Group.", group);
    _addElements.apply(this, group.members);
};

//(member*)
Stage.prototype.addElements = _addElements;

Stage.prototype.translate = function (x, y) {
    this.tx += x;
    this.ty += y;
};

Stage.prototype.resetTranslation = function (x, y) {
    this.tx = x;
    this.ty = y;
};

Stage.prototype.setSize = function(w, h) {
    this.width = w;
    this.height = h;
};

module.exports = Stage;

},{"./Group":6,"./utils":11}],9:[function(require,module,exports){
/**
 * Created by jiengfei on 15-4-13.
 */
var Group = require('./Group');
var wvv = require('./wvv');
var tween = require('./tween');
function init() {
    var Stage = require('./Stage');
    var DrawRecorder = require('./DrawRecorder');

    var Element = require('./Element');
    var gdr = new DrawRecorder().beginPath().rect(0, 0, 50, 50).stroke().drawable(50, 50);
    //
    var shape1 = new Element(gdr);
    var shape2 = new Element(gdr);
    var shape3 = new Element(gdr);
    //utils.print(shape1);
    shape1.scale(0.5, 0.5);
    shape2.setTranslate(0, 50);
    shape3.rotate(45);
    shape3.scale(2, 2);
    shape3.move(50, 100);
    //
    var group = (new Group()).add(shape1).skipH(100).add(shape2).nextLine()
        .skipV(100).add(shape3);
    //var group = (new Group()).skipH(100).skipV(100).add(shape3);
    var stage = new Stage();
    wvv.setStage("demoCanvas", stage);
    stage.addGroup(group);
    wvv.gameLoop();
    //convert to radian
    tween.get(shape2).to({"r": 45}).ease(function (x) {
        return x;
    }).duration(1000).start();
    tween.get(shape1).to({'tx': 400, 'ty': 200, "sx": 5, 'r':90}).ease(function (x) {
        return x;
    }).duration(1000).start();


    var img = new Image();   // Create new img element
    img.addEventListener("load", function() {
        console.log("image loaded 0");
    }, false);
    img.onload = function() {
      console.log("image onload 1");
    };
    img.onload = function() {
        console.log("image onload 2");
    };
    img.src = 'res/img/backdrop.png'; // Set source path
};

init();
},{"./DrawRecorder":3,"./Element":4,"./Group":6,"./Stage":8,"./tween":10,"./wvv":12}],10:[function(require,module,exports){
/**
 * Created by jiengfei on 15-3-25.
 */
var utils = require('./utils');
var wvv = require('./wvv');

var DEFAULT_ANIMATION_DURATION = 300;

var _animations = [];

var _advance = function () {
    _animations.forEach(function (a) {
        a.advance();
    });
};
wvv.registerCb(_advance);

var tween = {
    addHeartbeat: function (anim) {
        _animations.push(anim);
    },
    removeHeartbeat: function (anim) {
        utils.removeFromArray(_animations, anim);
    },
    get: function (target) {
        return new Animation(target);
    }
};

var ease = tween.ease = {
    linear: function (t) {
        return t;
    }
};

function Animation(target) {
    this._target = target;
    this._durationMs = DEFAULT_ANIMATION_DURATION;
    this._ease = ease.linear;
    this._listeners = [];
    this._fromProps = null;
    this._toProps = null;
    this._animatedKeys = null;
    this._animatedValues = null;
    this._startTimeMs = 0;
    this.advance = function () {
        utils.assert(this instanceof Animation, "this = %s", this);
        var progress = (utils.nowMs() - this._startTimeMs) / this._durationMs;
        if (progress >= 1) {
            progress = 1;
            tween.removeHeartbeat(this);
        }
        progress = this._ease(progress);
        var keys = this._animatedKeys;
        var values = this._animatedValues;
        var target = this._target;
        for (var index = 0, length = keys.length; index < length; ++index) {
            var pair = values[index];
            var curValue = (pair[1] - pair[0]) * progress + pair[0];
            target[keys[index]] = curValue;
        }
        target.delayBuildMatrixFunc();
    };
};

Animation.prototype.to = function (props) {
    this._toProps = props;
    return this;
};

Animation.prototype.duration = function (timems) {
    this._durationMs = timems;
    return this;
};

Animation.prototype.ease = function (e) {
    this._ease = e;
    return this;
};

//TODO
Animation.prototype.listener = function (l) {
    this._listeners.add(l);
    return this;
};

Animation.prototype.start = function () {
    var useCurValue = false;
    var fromProps = this._fromProps;
    if (!fromProps) {
        useCurValue = true;
    }

    var toProps = this._toProps;
    var target = this._target;
    var animatedKeys = this._animatedKeys = [];
    var animatedValues = this._animatedValues = [];
    var keys = Object.keys(toProps);
    for (var index = 0, length = keys.length; index < length; ++index) {
        var key = keys[index];
        if (target.hasOwnProperty(key)) {
            var toValue = toProps[key];
            var fromValue = useCurValue ? target[key] : fromProps[key];
            animatedKeys.push(key);
            animatedValues.push([fromValue, toValue]);
        }
    }
    this._startTimeMs = utils.nowMs();
    //add this to advance list
    tween.addHeartbeat(this);
};

module.exports = tween;
},{"./utils":11,"./wvv":12}],11:[function(require,module,exports){
"use strict";

/**
 * Use assert() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */
var CONFIG = require('./CONFIG');
var utils = {};
utils.assert = function (condition, format, a, b, c, d, e, f) {
    if (CONFIG.DEV) {
        if (format === undefined) {
            throw new Error('invariant requires an error message argument');
        }
    }

    if (!condition) {
        var error;
        if (format === undefined) {
            error = new Error(
                'Minified exception occurred; use the non-minified dev environment ' +
                'for the full error message and additional helpful warnings.'
            );
        } else {
            var args = [a, b, c, d, e, f];
            var argIndex = 0;
            error = new Error(
                'Invariant Violation: ' +
                format.replace(/%s/g, function () {
                    return args[argIndex++];
                })
            );
        }

        error.framesToPop = 1; // we don't care about invariant's own frame
        throw error;
    }
};

utils.oncePoster = function (cb, postFunc, arg) {
    var posted = false;
    return function () {
        if (!posted) {
            posted = true;
            postFunc(function () {
                cb(arg);
                posted = false;
            });
        }
    };
};

utils.EmptyFunction = function () {
};

utils.extend = function (obj) {
    var length = arguments.length;
    if (length < 2 || obj == null) return obj;
    for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = Object.keys(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
            var key = keys[i];
            obj[key] = source[key];
        }
    }
    return obj;
};

utils.isObject = function (obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

utils.clone = function (obj) {
    if (!utils.isObject(obj)) return obj;
    return Array.isArray(obj) ? obj.slice() : utils.extend({}, obj);
};

utils.print = function (obj) {
    for (var key in obj) {
        console.log("{" + key + ":" + obj[key] + "}");
    }
};

utils.nowMs = function () {
  return Date.now();
};

utils.removeFromArray = function(arr, elem) {
    var index = arr.indexOf(elem);
    if (index >= 0) {
        arr.splice(index, 1);
    }
};

utils.radian = function(angle) {
    return angle * Math.PI / 180;
};

module.exports = utils;

},{"./CONFIG":2}],12:[function(require,module,exports){
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
        stage.setSize(canvas.width, canvas.height);
        _delegateTouchEventToStage(canvas, stage);
        _layers.push([layerId, stage, canvas, dc, defaultFlags]);
    };

    var callbacks = [];
    var onceCallback = [];
    wvv.post = function(cb) {
        onceCallback.push(cb);
    };
    wvv.registerCb = function(cb) {
        callbacks.push(cb);
    };
    wvv.unRegisterCb = function(cb) {
        var index = callbacks.indexOf(cb);
        if (index >= 0) {
            callbacks.splice(index, 1);
        }
    };

    var invokeFunction = function (f) {
        f();
    };
    var _handleCallbacks = function() {
        callbacks.forEach(invokeFunction);
        var ocbs = onceCallback;
        onceCallback = [];
        ocbs.forEach(invokeFunction);
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
            _render();
            if (devEnv) {
                window.setTimeout(_loop, 100);
            } else {
                window.requestAnimationFrame(_loop, null);
            }
        }());
    };

    module.exports = wvv;

}());
},{"./CONFIG":2}]},{},[9]);
