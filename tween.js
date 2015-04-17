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