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
    dc.transform(mat.a, mat.c, mat.b, mat.d, mat.tx, mat.ty);
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

        console.log("rpx="+rpx+";cx="+cx+";r="+ e.r+';tx='+ e.tx+";ty="+ e.ty);
        matrix.translate(rpx, rpy);
        matrix.rotate(e.r);
        matrix.translate(e.tx -e.rpx, e.ty-e.rpy);
        //matrix.translate(spx, spy);
        //matrix.scale(e.sx, e.sy);
        //matrix.translate(rpx - spx, rpy - spy);
        //matrix.rotate(e.r);
        //matrix.translate(e.tx - rpx, e.ty - rpy);
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
},{"./ADrawable":1}],6:[function(require,module,exports){
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
    console.log("after move tx="+this.tx+";ty="+this.ty);
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
/**
 * Created by jiengfei on 15-4-13.
 */
/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */


(function () {
    /**
     * The Matrix class is now an object, which makes it a lot faster,
     * here is a representation of it :
     * | a | b | tx|
     * | c | d | ty|
     * | 0 | 0 | 1 |
     *
     * @class Matrix
     * @constructor
     */
    var Matrix = function () {
        /**
         * @property a
         * @type Number
         * @default 1
         */
        this.a = 1;

        /**
         * @property b
         * @type Number
         * @default 0
         */
        this.b = 0;

        /**
         * @property c
         * @type Number
         * @default 0
         */
        this.c = 0;

        /**
         * @property d
         * @type Number
         * @default 1
         */
        this.d = 1;

        /**
         * @property tx
         * @type Number
         * @default 0
         */
        this.tx = 0;

        /**
         * @property ty
         * @type Number
         * @default 0
         */
        this.ty = 0;
    };

    /**
     * Creates a Matrix object based on the given array. The Element to Matrix mapping order is as follows:
     *
     * a = array[0]
     * b = array[1]
     * c = array[3]
     * d = array[4]
     * tx = array[2]
     * ty = array[5]
     *
     * @method fromArray
     * @param array {Array} The array that the matrix will be populated from.
     */
    var fromArray = Matrix.prototype.fromArray = function (array) {
        this.a = array[0];
        this.b = array[1];
        this.c = array[3];
        this.d = array[4];
        this.tx = array[2];
        this.ty = array[5];
    };

    /**
     * Creates an array from the current Matrix object.
     *
     * @method toArray
     * @param transpose {Boolean} Whether we need to transpose the matrix or not
     * @return {Array} the newly created array which contains the matrix
     */
    Matrix.prototype.toArray = function (transpose) {
        if (!this.array) this.array = new Float32Array(9);
        var array = this.array;

        if (transpose) {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
        }
        else {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        }

        return array;
    };

    /**
     * Get a new position with the current transformation applied.
     * Can be used to go from a child's coordinate space to the world coordinate space. (e.g. rendering)
     *
     * @method apply
     * @param pos {Point} The origin
     * @param [newPos] {Point} The point that the new position is assigned to (allowed to be same as input)
     * @return {Point} The new point, transformed through this matrix
     */
    Matrix.prototype.apply = function (pos, newPos) {
        newPos = newPos || {}

        newPos.x = this.a * pos.x + this.c * pos.y + this.tx;
        newPos.y = this.b * pos.x + this.d * pos.y + this.ty;

        return newPos;
    };

    /**
     * Get a new position with the inverse of the current transformation applied.
     * Can be used to go from the world coordinate space to a child's coordinate space. (e.g. input)
     *
     * @method applyInverse
     * @param pos {Point} The origin
     * @param [newPos] {Point} The point that the new position is assigned to (allowed to be same as input)
     * @return {Point} The new point, inverse-transformed through this matrix
     */
    Matrix.prototype.applyInverse = function (pos, newPos) {
        newPos = newPos || {}

        var id = 1 / (this.a * this.d + this.c * -this.b);

        newPos.x = this.d * id * pos.x + -this.c * id * pos.y + (this.ty * this.c - this.tx * this.d) * id;
        newPos.y = this.a * id * pos.y + -this.b * id * pos.x + (-this.ty * this.a + this.tx * this.b) * id;

        return newPos;
    };

    /**
     * Translates the matrix on the x and y.
     *
     * @method translate
     * @param {Number} x
     * @param {Number} y
     * @return {Matrix} This matrix. Good for chaining method calls.
     **/
    Matrix.prototype.translate = function (x, y) {
        this.tx += x;
        this.ty += y;

        return this;
    };

    /**
     * Applies a scale transformation to the matrix.
     *
     * @method scale
     * @param {Number} x The amount to scale horizontally
     * @param {Number} y The amount to scale vertically
     * @return {Matrix} This matrix. Good for chaining method calls.
     **/
    Matrix.prototype.scale = function (x, y) {
        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;

        return this;
    };


    /**
     * Applies a rotation transformation to the matrix.
     * @method rotate
     * @param {Number} angle The angle in radians.
     * @return {Matrix} This matrix. Good for chaining method calls.
     **/
    Matrix.prototype.rotate = function (angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;

        this.a = a1 * cos - this.b * sin;
        this.b = a1 * sin + this.b * cos;
        this.c = c1 * cos - this.d * sin;
        this.d = c1 * sin + this.d * cos;
        this.tx = tx1 * cos - this.ty * sin;
        this.ty = tx1 * sin + this.ty * cos;

        return this;
    };

    /**
     * Appends the given Matrix to this Matrix.
     *
     * @method append
     * @param {Matrix} matrix
     * @return {Matrix} This matrix. Good for chaining method calls.
     */
    Matrix.prototype.append = function (matrix) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;

        this.a = matrix.a * a1 + matrix.b * c1;
        this.b = matrix.a * b1 + matrix.b * d1;
        this.c = matrix.c * a1 + matrix.d * c1;
        this.d = matrix.c * b1 + matrix.d * d1;

        this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
        this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;

        return this;
    };

    /**
     * Resets this Matix to an identity (default) matrix.
     *
     * @method identity
     * @return {Matrix} This matrix. Good for chaining method calls.
     */
    Matrix.prototype.identify = function () {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.tx = 0;
        this.ty = 0;

        return this;
    };

    var identityMatrix = new Matrix();

    module.exports = {
        identityMatrix: identityMatrix,
        create:  function() {
            var m = new Matrix();
            if (arguments.length < 1) {
                return m;
            }
            fromArray.apply(m, arguments);
            return m;
        }
    };
}());


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
    //shape1.scale(0.5, 0.5);
    //shape2.setTranslate(0, 50);
    //shape3.rotate(120);

    var group = (new Group()).add(shape1).skipH(100).add(shape2).nextLine()
        .skipV(100).add(shape3);

    var stage = new Stage();
    wvv.setStage("demoCanvas", stage);
    stage.addGroup(group);
    wvv.gameLoop();
    //convert to radian
    tween.get(shape1).to({"r": 180 * Math.PI / 180}).ease(function (x) {
        return x;
    }).duration(10000).start();
    //tween.get(shape1).to({'tx': 400, 'ty': 200, "sx": 5}).ease(function (x) {
    //    return x;
    //}).duration(1000).start();
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
    utils.print(keys);
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
