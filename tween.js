/**
 * Created by jiengfei on 15-3-25.
 */
(function() {
    var DEFAULT_ANIMATION_DURATION = 300;

    var tween = {
        _registry: [],
        advance: function() {
        },
        get: function(target) {
            return new Animation(target);
        }
    };

    var ease = tween.ease = {
        linear: function(t) {
            return t;
        }
    };

    function Animation(target) {
        this._target = target;
        this._durationMs = DEFAULT_ANIMATION_DURATION;
        this._ease = ease.linear;
        this._elapsedMs = 0;
        this._listeners = [];
        this._fromProps = null;
        this._toProps = null;
    };

    Animation.prototype.to = function(props) {

    };

    Animation.prototype.duration = function(timems) {

    };

    Animation.prototype.ease = function(e) {
        this._ease = e;
    };

    Animation.prototype.listener = function(l) {
        this._listeners.add(l);
    };
    Animation.prototype.start = function() {

    };

    module.exports = tween;
});