if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    'use strict';

    var _ = require('underscore'),

        unshift = Array.prototype.unshift,
        nullFunction = function () {
        };


    function constructorFrom(spec) {
        if (spec && _.has(spec, 'constructor') && typeof spec.constructor === 'function') {
            return spec.constructor;
        } else {
            return function () {
            };
        }
    }

    function applyWithSuperDelegate(func, ctx, callArgs, superFunc) {
        var args = callArgs;
        if (superFunc !== nullFunction) {
            args = [_.bind(superFunc, ctx)];
            unshift.apply(args, callArgs);
        }
        return func.apply(ctx, args);
    }

    function wrapWithSuper(func, superFunc) {
        return function () {
            return applyWithSuperDelegate(func, this, arguments, superFunc);
        };
    }

    function wrapAllFunctionsWithSuper(spec, parentProto) {
        var wrappedSpec = {};

        if (spec) {
            _.each(spec, function (value, key) {
                var superFunc = _.isFunction(parentProto[key]) ? parentProto[key] : nullFunction;
                if (key !== 'constructor') {
                    wrappedSpec[key] = _.isFunction(value) ? wrapWithSuper(value, superFunc) : value;
                }
            });
        }

        return wrappedSpec;
    }

    function extend(parent, spec) {
        var subClassConstructor = constructorFrom(spec),
            SubClass = function () {
                applyWithSuperDelegate(subClassConstructor, this, arguments, parent);
            };

        SubClass.prototype = _.extend({}, parent.prototype, _.omit(spec, 'constructor'), {__super__: parent.prototype});
        SubClass.extend = function (subSpec) {
            return extend(SubClass, subSpec);
        };
        SubClass.__super__ = parent;

        return SubClass;
    }

    var Class = {
        create: function (spec) {
            return extend(nullFunction, spec);
        }
    };

    return {
        Class: Class
    };
});