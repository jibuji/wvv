"use strict";
var ADrawable = require('./ADrawable');

function ImageDrawable(w, h, src) {
    ADrawable.apply(this);
    this.width = w;
    this.height = h;
    this.intrinsicWidth = this.intrinsicHeight = -1;
    this.loadedSuccess = false;
    var thisObj = this;
    var image = this.image = new Image(w, h);
    image.onload = function () {
        thisObj.loadedSuccess = true;
        thisObj.intrinsicWidth = image.naturalWidth;
        thisObj.intrinsicHeight = image.naturalHeight;
    };
    image.onerror = function () {
        thisObj.loadedSuccess = false;
        thisObj.intrinsicWidth = -1;
        thisObj.intrinsicHeight = -1;
    };
    image.src = src;

    this.draw = function (dc) {
        if (thisObj.loadedSuccess) {
            var sx = thisObj.sx;
            var sy = thisObj.sy;
            dc.scale(sx, sy);
            dc.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight,
                0, 0, thisObj.width, thisObj.height);
            dc.scale(1 / sx, 1 / sy);
        }
    };
    return this;
};

ImageDrawable.prototype = Object.create(ADrawable.prototype);

module.exports = ImageDrawable;