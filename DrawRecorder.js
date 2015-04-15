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

