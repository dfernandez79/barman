(function () {

    'use strict';

    function factory( _ ) {

        var bind = _.bind,
            each = _.each,
            isUndefined = _.isUndefined,
            isObject = _.isObject,
            isFunction = _.isFunction,
            extend = _.extend,
            has = _.has,
            toArray = _.toArray,

            getPrototypeOf = Object.getPrototypeOf,
            createObject = Object.create,

            ERR_CONFLICT = 'This property was defined by multiple merged objects, override it with the proper implementation',
            ERR_PROPERTY_NOT_DEFINED = 'The property {name} is not defined',
            ERR_REQUIRED = 'An implementation is required',
            ERR_CONSTRUCTOR_TYPE = 'The constructor property must be a function',

            CLASS_FACTORY_ATTRIBUTE = '*classFactory*';


        function expand( msg, values ) {

            return msg.replace(/\{([a-zA-Z0-9]+)\}/g, function ( match, key ) {
                return values[key] || '';
            });

        }


        function optional( arg, defaultValue ) {

            if ( isUndefined(defaultValue) ) { defaultValue = {}; }
            return isUndefined(arg) ? defaultValue : arg;

        }


        function mapProperties( srcObj, iterator, result ) {

            if ( !result ) { result = {}; }

            if ( srcObj ) {
                each(srcObj, function ( value, prop ) {

                    result[prop] = iterator.call(this, value, prop);

                }, result);
            }

            return result;

        }


        function assertDefinedProperty( property, name ) {

            if ( isUndefined(property) ) {
                throw new ReferenceError(expand(ERR_PROPERTY_NOT_DEFINED, {name: name}));
            }

        }


        function conflict() {
            throw new Error(ERR_CONFLICT);
        }


        function required() {
            throw new Error(ERR_REQUIRED);
        }


        function mergeProperty( value, prop ) {

            /*jshint validthis:true */

            var thisValue = this[prop];

            if ( isUndefined(thisValue) || thisValue === value || thisValue === required ) {
                return value;
            } else if ( value === required ) {
                return thisValue;
            } else {
                return conflict;
            }

        }


        function merge() {

            var result = {};

            each(arguments, function ( obj ) {

                mapProperties(obj, mergeProperty, result);

            });

            return result;

        }


        function Nil() { }

        Nil.__super__ = Nil.prototype;

        Nil.prototype._super = function ( methodName ) {

            var thisPrototype = getPrototypeOf(this),
                superPrototype = getPrototypeOf(thisPrototype);

            if ( !methodName ) {
                return superPrototype;
            } else {
                var superProp = superPrototype[methodName];
                assertDefinedProperty(superProp, methodName);
                return isFunction(superProp) ? bind(superProp, this) : superProp;
            }

        };


        function markAsClassFactory( obj ) {

            obj[CLASS_FACTORY_ATTRIBUTE] = true;
            return obj;

        }


        function isClassFactory( obj ) {

            return isObject(obj) && obj[CLASS_FACTORY_ATTRIBUTE] === true;

        }


        var defaultClassFactory = markAsClassFactory({

            createClass: function ( Parent, instanceMethods, staticMethods ) {

                var proto = extend(createObject(Parent.prototype), instanceMethods);

                if ( !has(proto, 'constructor') ) {

                    proto.constructor = function () {
                        Parent.apply(this, arguments);
                    };

                } else if ( typeof proto.constructor !== 'function' ) {

                    throw new TypeError(ERR_CONSTRUCTOR_TYPE);

                }

                var ctor = extend(proto.constructor, staticMethods, {__super__: Parent.prototype });

                if ( isUndefined(proto._super) ) { proto._super = Nil.prototype._super; }

                ctor.prototype = proto;
                ctor.extend = Nil.extend;

                return ctor;

            }

        });


        Nil.extend = function () {

            var args = toArray(arguments),
                classFactory = (isClassFactory(args[0])) ? args.shift() : defaultClassFactory;

            args.unshift(this);

            return classFactory.createClass.apply(classFactory, args);

        };


        var Class = {
            create: function () {

                return Nil.extend.apply(Nil, arguments);

            }
        };


        var AbstractClassFactory = Class.create({

            defaultCreateClass: bind(defaultClassFactory.createClass, defaultClassFactory),

            createClass: required

        });
        markAsClassFactory(AbstractClassFactory.prototype);


        var TraitsClassFactory = AbstractClassFactory.extend({

            constructor: function ( traits ) { this.traits = traits; },

            createClass: function ( Parent, instanceMethods, staticMethods ) {

                var traitComposition = merge.apply(null, this.traits);

                return this.defaultCreateClass(Parent, extend(traitComposition, instanceMethods), staticMethods);

            }

        });


        function withTraits() {
            return new TraitsClassFactory(toArray(arguments));
        }

        return {
            extend: extend,
            merge: merge,
            conflict: conflict,

            Nil: Nil,

            markAsClassFactory: markAsClassFactory,
            isClassFactory: isClassFactory,
            AbstractClassFactory: AbstractClassFactory,

            defaultClassFactory: defaultClassFactory,
            Class: Class,

            required: required,

            withTraits: withTraits
        };

    }


    if ( typeof define === 'function' && define.amd ) {
        // AMD (ie requirejs)
        define(['underscore'], factory);
    } else if ( typeof module !== 'undefined' && module.exports ) {
        // Node
        module.exports = factory(require('underscore'));
    } else {
        window.barman = factory(window._);
    }

})();