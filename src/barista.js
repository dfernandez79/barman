if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    'use strict';

    var _ = require('underscore'),
        has = _.has,
        bind = _.bind,
        extend = _.extend,
        Nil = function () {
        };

    var defaultClassFactory = {
        createClass: function (Parent, spec) {
            var proto = Object.create(Parent.prototype);
            extend(proto, spec);

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
    };

    function createClass(Parent, classFactoryArg, specArg) {
        var spec = specArg ? specArg : classFactoryArg,
            classFactory = specArg ? classFactoryArg : defaultClassFactory;

        return classFactory.createClass(Parent, spec);
    }

    return {
        Class: {
            create: function (classFactory, spec) {
                return createClass(Nil, classFactory, spec);
            }
        },

        defaultClassFactory: defaultClassFactory
    };
});