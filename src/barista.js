if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    'use strict';

    var _ = require('underscore'),
        each = _.each,
        map = _.map,
        has = _.has,
        bind = _.bind,
        extend = _.extend,
        isUndefined = _.isUndefined,
        isFunction = _.isFunction,
        isObject = _.isObject,
        Nil = function () {
        },
        CLASS_FACTORY_ATTRIBUTE = 'Barista *classFactory*';

    function markAsClassFactory(obj) {
        obj[CLASS_FACTORY_ATTRIBUTE] = true;
        return obj;
    }

    function optional(arg, defaultValue) {
        if (isUndefined(defaultValue)) {
            defaultValue = {};
        }
        return isUndefined(arg) ? defaultValue : arg;
    }

    function isClassFactory(obj) {
        return isObject(obj) && obj[CLASS_FACTORY_ATTRIBUTE] === true;
    }

    function createClassOptionsFrom(args) {
        var options = {classFactory: defaultClassFactory, parent: args[0]},
            i = 1;

        if (isClassFactory(args[i])) {
            options.classFactory = args[i++];
        }
        options.instanceMethods = optional(args[i++]);
        options.staticMethods = optional(args[i]);

        return options;
    }

    function createClass() {
        var options = createClassOptionsFrom(arguments);
        return options.classFactory.createClass(options.parent, options.instanceMethods, options.staticMethods);
    }

    function extendClass(classFactory, instanceMethods, staticMethods) {
        /*jshint validthis:true */
        return createClass(this, classFactory, instanceMethods, staticMethods);
    }

    var defaultClassFactory = markAsClassFactory({
        createClass: function (Parent, instanceMethods, staticMethods) {
            var proto = Object.create(Parent.prototype);
            extend(proto, instanceMethods);

            if (!has(proto, 'constructor') || typeof proto.constructor !== 'function') {
                proto.constructor = function () {
                };
            }

            var ctor = proto.constructor;
            extend(ctor, staticMethods);
            ctor.__super__ = Parent.prototype;
            proto._super = function (methodName) {
                if (!methodName) {
                    return ctor.__super__;
                } else {
                    var superMethod = ctor.__super__[methodName];
                    if (!superMethod) {
                        throw new ReferenceError('The method ' + methodName + ' is not defined in the super class');
                    }
                    return bind(superMethod, this);
                }
            };
            ctor.prototype = proto;
            ctor.extend = extendClass;

            return ctor;
        }
    });

    var Class = {
        create: function (classFactory, instanceMethods, staticMethods) {
            return createClass(Nil, classFactory, instanceMethods, staticMethods);
        }
    };

    function classFactoryMixin(proto) {
        markAsClassFactory(proto);
        proto.defaultCreateClass = bind(defaultClassFactory.createClass, defaultClassFactory);
    }

    var MixinClassFactory = Class.create({
        constructor: function (mixins) {
            this.mixins = map(mixins, function (mixin) {
                if (isFunction(mixin)) {
                    return mixin;
                } else if (isObject(mixin)) {
                    return function (obj) {
                        extend(obj, mixin);
                    };
                }
                throw new TypeError('Only objects or functions can be used as mixins');
            });
        },

        createClass: function (Parent, instanceMethods, staticMethods) {
            var instanceMethodsWithMixins = {};

            each(this.mixins, function (fn) {
                fn(instanceMethodsWithMixins);
            });
            extend(instanceMethodsWithMixins, instanceMethods);

            return this.defaultCreateClass(Parent, instanceMethodsWithMixins, staticMethods);
        }
    });
    classFactoryMixin(MixinClassFactory.prototype);

    return {
        defaultClassFactory: defaultClassFactory,

        markAsClassFactory: markAsClassFactory,

        Class: Class,

        classFactoryMixin: classFactoryMixin,

        withMixins: function () {
            return new MixinClassFactory(arguments);
        }
    };
});