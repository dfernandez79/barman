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
        CLASS_FACTORY_ATTRIBUTE = 'Barista *classFactory*',
        METHOD_DESCRIPTOR_ATTRIBUTE = 'Barista *method descriptor*';

    function markSpecial(attribute, obj) {
        obj[attribute] = true;
        return obj;
    }

    function markAsClassFactory(obj) {
        return markSpecial(CLASS_FACTORY_ATTRIBUTE, obj);
    }

    function methodDescriptorMixin(obj) {
        return markSpecial(METHOD_DESCRIPTOR_ATTRIBUTE, obj);
    }

    function optional(arg, defaultValue) {
        if (isUndefined(defaultValue)) {
            defaultValue = {};
        }
        return isUndefined(arg) ? defaultValue : arg;
    }

    function hasSpecial(attribute, obj) {
        return isObject(obj) && obj[attribute] === true;
    }

    function isClassFactory(obj) {
        return hasSpecial(CLASS_FACTORY_ATTRIBUTE, obj);
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

    function isMethodDescriptor(method) {
        return hasSpecial(METHOD_DESCRIPTOR_ATTRIBUTE, method);
    }

    function assertValidSuperMethod(superMethod, methodName) {
        if (!superMethod) {
            throw new ReferenceError('The method ' + methodName + ' is not defined in the super class');
        }
    }

    var defaultClassFactory = markAsClassFactory({
        createClass: function (Parent, instanceMethods, staticMethods) {
            var proto = Object.create(Parent.prototype);
            extend(proto, this.processMethods(Parent, instanceMethods));

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
                    assertValidSuperMethod(superMethod, methodName);
                    return bind(superMethod, this);
                }
            };
            ctor.prototype = proto;
            ctor.extend = extendClass;

            return ctor;
        },

        processMethods: function (Parent, methods) {
            each(methods, function (method, name) {
                if (isMethodDescriptor(method)) {
                    methods[name] = method.createMethod(Parent, name);
                }
            });
            return methods;
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
        return proto;
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
    function withMixins() {
        return new MixinClassFactory(arguments);
    }

    var AliasOfSuper = Class.create(
        withMixins(methodDescriptorMixin),
        {
            constructor: function (name) {
                this.name = name;
            },

            createMethod: function (Parent) {
                var superMethod = Parent.prototype[this.name];
                assertValidSuperMethod(superMethod, this.name);
                return superMethod;
            }
        });

    return {
        defaultClassFactory: defaultClassFactory,

        classFactoryMixin: markAsClassFactory,

        Class: Class,

        aliasOfSuper: function (name) {
            return new AliasOfSuper(name);
        },

        withMixins: withMixins
    };
});