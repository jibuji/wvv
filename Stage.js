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
    this.elements = [];
};

Stage.prototype.draw = function (dc) {
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

module.exports = Stage;
