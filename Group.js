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