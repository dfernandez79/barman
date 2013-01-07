if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    'use strict';

    var _ = require('underscore'),
        has = _.has,
        bind = _.bind,
        Nil = function () {
        };


    function createClass(Parent, spec) {
        var proto = Object.create(Parent.prototype);

        _.extend(proto, spec);

        if (!has(proto, 'constructor') || typeof proto.constructor !== 'function') {
            proto.constructor = function () {
            };
        }

        var ctor = proto.constructor;
        ctor.__super__ = Parent.prototype;
        proto._super = function (methodName) {
            if (!methodName) {
                return ctor.__super__;
            } else {
                var superMethod = ctor.__super__[methodName];
                if (!superMethod) {
                    throw new ReferenceError();
                }
                return bind(superMethod, this);
            }
        };
        ctor.prototype = proto;
        ctor.extend = function (subSpec) {
            return createClass(this, subSpec);
        };

        return ctor;
    }

    var Class = {
        create: function (spec) {
            return createClass(Nil, spec);
        }
    };

    return {
        Class: Class
    };
});