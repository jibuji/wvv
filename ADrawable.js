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