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
var ArrayProto = Array.prototype
var slice = ArrayProto.slice;
var push = ArrayProto.push;

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

utils.oncePoster = function (cb, postFunc) {
    var posted = false;
    return function (arg) {
        if (!posted) {
            posted = true;
            console.log("arg = "+arg);
            console.trace();
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

utils.appendArray = function(array, argArray) {
    push.apply(array, argArray);
};

utils.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
        var args = boundArgs.slice();
        push.apply(args, arguments);
        return func.apply(this, args);
    };
    return bound;
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
