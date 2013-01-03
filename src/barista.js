if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    'use strict';

    var _ = require('underscore'),
        has = _.has,
        clone = _.clone,
        result = _.result,
        bind = _.bind,
        push = Array.prototype.push,
        nullFunction = function () {
        };


    function constructorFrom(spec) {
        if (spec && has(spec, 'constructor') && typeof spec.constructor === 'function') {
            return spec.constructor;
        } else {
            return function () {
            };
        }
    }

    function isMethodDescriptor(spec, prop) {
        return typeof spec[prop] === 'object' && result(spec[prop], 'isMethodDescriptor');
    }

    function extend(Parent, spec) {
        var proto = Object.create(Parent.prototype);

        for (var prop in spec) {
            if (has(spec, prop)) {
                if (isMethodDescriptor(spec, prop)) {
                    spec[prop].create(prop, proto, Parent.prototype);
                } else {
                    proto[prop] = spec[prop];
                }
            }
        }

        if (!has(proto, 'constructor') || typeof proto.constructor !== 'function') {
            proto.constructor = function () {
            };
        }

        var ctor = proto.constructor;
        ctor.__super__ = Parent.prototype;
        ctor.prototype = proto;
        ctor.extend = function (subSpec) {
            return extend(ctor, subSpec);
        };

        return ctor;
    }

    var Class = {
        create: function (spec) {
            return extend(nullFunction, spec);
        }
    };

    var InjectSuper = Class.create({
        constructor: function (func) {
            this.func = func;
        },

        isMethodDescriptor: true,

        create: function (name, proto, parentProto) {
            var func = this.func;

            proto[name] = function () {
                var args = [bind(parentProto[name], this)];
                push.apply(args, arguments);
                return func.apply(this, args);
            };
        }
    });

    function injectSuper(func) {
        return new InjectSuper(func);
    }

    return {
        Class: Class,
        injectSuper: injectSuper
    };
});