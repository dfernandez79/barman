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

    function object(obj) {
        return obj ? obj : {}
    }

    function optionsFrom(args) {
        var options = {classFactory: defaultClassFactory, parent: args[0]};

        if (isClassFactory(args[0])) {
            options.classFactory = args[0]
            options.instanceMethods = args[1] ? args[1] : {};
            options.staticMethods = args[2] ? args[2] : {};
        } else {
            options.instanceMethods = args[0]
        }

        return options;
    }

    function createClass() {
        var options = optionsFrom(arguments);

        return options.classFactory.createClass(options.parent, options.instanceMethods, options.staticMethods);
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