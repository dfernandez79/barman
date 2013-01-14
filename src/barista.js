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
        getPrototypeOf = Object.getPrototypeOf,
        Nil = function () { },
        CLASS_FACTORY_ATTRIBUTE = '*classFactory*',
        METHOD_DESCRIPTOR_ATTRIBUTE = '*methodDescriptor*';

    function markSpecial(attribute, obj) {
        obj[attribute] = true;
        return obj;
    }

    function markAsClassFactory(obj) { return markSpecial(CLASS_FACTORY_ATTRIBUTE, obj); }

    function methodDescriptorMixin(obj) { return markSpecial(METHOD_DESCRIPTOR_ATTRIBUTE, obj); }

    function optional(arg, defaultValue) {
        if (isUndefined(defaultValue)) { defaultValue = {}; }
        return isUndefined(arg) ? defaultValue : arg;
    }

    function hasSpecial(attribute, obj) { return isObject(obj) && obj[attribute] === true; }

    function isClassFactory(obj) { return hasSpecial(CLASS_FACTORY_ATTRIBUTE, obj); }

    function isMethodDescriptor(method) { return hasSpecial(METHOD_DESCRIPTOR_ATTRIBUTE, method); }

    function createClassOptionsFrom(args) {
        var options = {classFactory: defaultClassFactory, parent: args[0]},
            i = 1;

        if (isClassFactory(args[i])) { options.classFactory = args[i++]; }
        options.instanceMethods = optional(args[i++]);
        options.staticMethods = optional(args[i]);

        return options;
    }

    function createClass() {
        var options = createClassOptionsFrom(arguments);
        return options.classFactory.createClass(options.parent, options.instanceMethods, options.staticMethods);
    }

    function assertDefinedProperty(property, name, whereMsg) {
        if (isUndefined(property)) {
            throw new ReferenceError('The property ' + name + ' is not defined' + optional(whereMsg, ''));
        }
    }

    Nil.extend = function (classFactory, instanceMethods, staticMethods) {
        return createClass(this, classFactory, instanceMethods, staticMethods);
    };
    Nil.__super__ = Nil.prototype;
    Nil.prototype._super = function (methodName) {
        var thisPrototype = getPrototypeOf(this),
            superPrototype = getPrototypeOf(thisPrototype);

        if (!methodName) {
            return superPrototype;
        } else {
            var superMethod = superPrototype[methodName];
            assertDefinedProperty(superMethod, methodName);
            return bind(superMethod, this);
        }
    };

    function processMethods(methods, ctx) {
        each(methods, function (method, name) {
            if (isMethodDescriptor(method)) { methods[name] = method.createMethod(name, ctx); }
        });
        return methods;
    }

    var defaultClassFactory = markAsClassFactory({
        createClass: function (Parent, instanceMethods, staticMethods) {
            var proto = Object.create(Parent.prototype);
            extend(proto, processMethods(instanceMethods, {Parent: Parent}));

            if (!has(proto, 'constructor') || typeof proto.constructor !== 'function') {
                proto.constructor = function () { };
            }

            var ctor = proto.constructor;
            extend(ctor, staticMethods);
            ctor.__super__ = Parent.prototype;
            if (!has(proto, '_super')) { proto._super = Nil.prototype._super; }

            ctor.prototype = proto;
            ctor.extend = Nil.extend;

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
        proto.processMethods = processMethods;
        return proto;
    }

    var MixinClassFactory = Class.create({
        constructor: function (mixins) { this.mixins = map(mixins, this.asMixinFunction); },

        asMixinFunction: function (mixin) {
            if (isFunction(mixin)) {
                return mixin;
            } else if (isObject(mixin)) {
                return function (obj) { extend(obj, mixin); };
            }
            throw new TypeError('Only objects or functions can be used as mixins');
        },

        applyMixins: function (Parent, instanceMethods) {
            var instanceMethodsWithMixins = {},
                processMethodsContext = {Parent: Parent, mixinMethods: instanceMethodsWithMixins};

            each(this.mixins, function (fn) { fn(instanceMethodsWithMixins); });

            return extend(instanceMethodsWithMixins, this.processMethods(instanceMethods, processMethodsContext));
        },

        createClass: function (Parent, instanceMethods, staticMethods) {
            return this.defaultCreateClass(Parent, this.applyMixins(Parent, instanceMethods), staticMethods);
        }
    });
    classFactoryMixin(MixinClassFactory.prototype);

    function withMixins() { return new MixinClassFactory(arguments); }

    var AbstractSimpleMethodAlias = Class.create(
        withMixins(methodDescriptorMixin),
        {
            constructor: function (name) { this.name = name; },

            createMethod: function (name, ctx) {
                var method = this.methodFrom(name, ctx);
                assertDefinedProperty(method, this.name, this.notDefinedMessageSuffix);
                return method;
            }
        }
    );

    function callSuperConstructorMixin(proto) {
        proto.constructor = function () { this._super().constructor.apply(this, arguments); };
        return proto;
    }

    var AliasOfSuper = AbstractSimpleMethodAlias.extend(
        withMixins(callSuperConstructorMixin),
        {
            methodFrom: function (name, ctx) { return ctx.Parent.prototype[this.name]; },
            notDefinedMessageSuffix: ' by the superclass'
        });

    var AliasOfMixin = AbstractSimpleMethodAlias.extend(
        withMixins(callSuperConstructorMixin),
        {
            methodFrom: function (name, ctx) { return ctx.mixinMethods[this.name]; },
            notDefinedMessageSuffix: ' by the mixins'
        });

    var Trait = Class.create({
            constructor: function (methods) { this.methods = methods; },
            _: function (name) {
                return this.methods[name];
            },
            flatten: function () {
                // TODO rename and implement
                return [this];
            }
        },
        {
            create: function (methods) { return new Trait(methods); }
        });

    var TraitSet = Class.create({
        constructor: function () { this.traits = []; },

        hasMoreThanOneTrait: function () { return this.traits.length > 1; },

        trait: function () { return this.traits[0]; },

        add: function (trait) {
            if (this.traits.indexOf(trait) !== -1) {
                this.traits.push(trait);
            }
            return this;
        }
    });

    var TraitsClassFactory = Class.create(
        withMixins(classFactoryMixin),
        {
            constructor: function (traits) { this.traits = traits; },

            composeTraits: function (instanceMethods) {
                var methodMap = {}, composed = {};

                each(this.flattenTraits(), function (trait) {
                    each(trait.methods, function (method, name) {
                        if (!has(methodMap, name)) {
                            methodMap[name] = new TraitSet();
                        }
                        methodMap[name].add(trait);
                    });
                });

                each(methodMap, function (traitSet, name) {
                    composed[name] = traitSet.hasMoreThanOneTrait() ? this.conflict(name, traitSet) : traitSet.trait();
                });

                extend(composed, instanceMethods);

                return composed;
            },

            flattenTraits: function () {
                return _.flatten(_.invoke(this.traits, 'flatten'));
            },

            conflict: function (name, traitSet) {
                // TODO finish
                return function () { return 'conflict'; };
            },

            createClass: function (Parent, instanceMethods, staticMethods) {
                return this.defaultCreateClass(Parent, this.composeTraits(instanceMethods), staticMethods);
            }
        });

    function withTraits() { return new TraitsClassFactory(arguments); }

    return {
        Nil: Nil,

        defaultClassFactory: defaultClassFactory,

        classFactoryMixin: markAsClassFactory,

        Class: Class,

        withMixins: withMixins,

        aliasOfSuper: function (name) { return new AliasOfSuper(name); },
        aliasOfMixin: function (name) { return new AliasOfMixin(name); },

        Trait: Trait,

        withTraits: withTraits
    };
});