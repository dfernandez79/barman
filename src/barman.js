//     barman 0.1.0
//     https://github.com/dfernandez79/barman
//     Copyright (c) 2013 Diego Fernandez
//     Barman may be freely distributed under the MIT license.

(function () {

    'use strict';

    function factory() {

        var ArrayProto = Array.prototype,
            nativeForEach = ArrayProto.forEach,
            slice = ArrayProto.slice,

            getPrototypeOf = Object.getPrototypeOf,
            createObject = Object.create,

            CLASS_FACTORY_ATTRIBUTE = '*classFactory*';


        // Common helper functions
        // -----------------------

        // These common helper functions are based on _underscore_ and _lodash_ implementations.
        //
        // Why these are included inline, instead of having a dependency to some _underscore_ compatible library?
        //
        // Because *barman* uses only a few functions, and the additional dependency made the setup hard.
        // So after evaluating the trade-offs, they were included here.
        //
        function has( object, property ) {
            return object ? Object.prototype.hasOwnProperty.call(object, property) : false;
        }

        function extend( obj ) {
            each(slice.call(arguments, 1), function ( source ) {
                if ( source ) {
                    for ( var prop in source ) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        }

        function isObject( obj ) {
            return obj === Object(obj);
        }

        function isUndefined( value ) {
            return typeof value == 'undefined';
        }

        function each( obj, func, context ) {
            if ( obj === null ) {
                return;
            }

            if ( nativeForEach && obj.forEach === nativeForEach ) {
                obj.forEach(func, context);
            } else if ( obj.length === +obj.length ) {
                for ( var i = 0, l = obj.length; i < l; i++ ) {
                    func.call(context, obj[i], i, obj);
                }
            } else {
                for ( var key in obj ) {
                    if ( has(obj, key) ) {
                        func.call(context, obj[key], key, obj);
                    }
                }
            }
        }


        // Merge
        // -----

        // `merge` is one of the main functions of *barman*.
        //
        // It's similar to the commonly used `extend(dest,o1,...,oN)`, but it uses the following strategy
        // for overwriting properties:
        //
        // * if values are different, mark the property as conflict
        // * if one of the values is marked as required, use the value that is not marked as required


        // ### Merge helper functions

        // #### mapProperties(_srcObj_, _iterator_, _result_)
        //
        // Returns a new object where each property is the result of applying the `iterator` function over `srcObj`:
        //
        //     result.prop = iterator(srcObj.prop, 'prop');
        //
        function mapProperties( srcObj, iterator, result ) {

            if ( !result ) { result = {}; }

            if ( srcObj ) {
                each(srcObj, function ( value, prop ) {

                    result[prop] = iterator.call(this, value, prop);

                }, result);
            }

            return result;

        }

        // #### conflict()
        //
        // Throws an error. Used to indicate _merge conflicts_.
        function conflict() {
            throw new Error(
                'This property was defined by multiple merged objects, override it with the proper implementation');
        }

        // #### required()
        //
        // Throws an error. Used to indicate that an implementation is required.
        function required() {
            throw new Error('An implementation is required');
        }

        // #### mergeProperty(_value_, _prop_)
        //
        // Used by `merge` to map each property.
        function mergeProperty( value, prop ) {

            /*jshint validthis:true */

            // The `this` context is set to the merge destination object, while
            // the arguments `value` and `prop` contains the property-value pair to merge.
            var thisValue = this[prop];

            if ( isUndefined(thisValue) || thisValue === value || thisValue === required ) {
                // If the property is not defined in the target object,
                // or both values are the same,
                // or the target value is the `required` marker; use the given `value`.

                return value;

            } else if ( value === required ) {
                // If the given `value` is the `required` marker, use the existing property value.

                return thisValue;

            } else {
                // If both values are different, but not undefined or required, return the `conflict` marker.

                return conflict;
            }

        }

        // ### merge(_object_,...)
        //
        // Returns a new object, that is the result of merging the properties of each one of the given objects.
        function merge() {

            var result = {};

            each(arguments, function ( obj ) {

                mapProperties(obj, mergeProperty, result);

            });

            return result;

        }

        // Nil
        // ---

        // `Nil` is the root of the *barman* _class hierarchy_.
        function Nil() { }

        // Every *barman* _class_ has a `__super__` property that returns the parent prototype.
        // The parent of `Nil` is `Nil`.
        Nil.__super__ = Nil.prototype;

        // ### \_super(_methodName_)
        // Every object created with *barman* inherits the `_super` method.
        Nil.prototype._super = function ( methodName ) {

            var thisPrototype = getPrototypeOf(this),
                superPrototype = getPrototypeOf(thisPrototype),
                self = this;

            // The _methodName_ argument is optional.
            if ( !methodName ) {
                // If _methodName_ is omitted, the function returns the parent prototype.

                return superPrototype;
            } else {
                // If _methodName_ is given, the function returns the parent function bound to _this_.

                var superProp = superPrototype[methodName];

                if ( isUndefined(superProp) ) {
                    throw new ReferenceError('The property ' + name + ' is not defined');
                }

                if ( typeof superProp == 'function' ) {
                    return function () {
                        return superProp.apply(self, arguments);
                    };
                }

                return superProp;
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

                    throw new TypeError('The constructor property must be a function');

                }

                var ctor = extend(proto.constructor, staticMethods, {__super__: Parent.prototype });

                if ( isUndefined(proto._super) ) { proto._super = Nil.prototype._super; }

                ctor.prototype = proto;
                ctor.extend = Nil.extend;

                return ctor;

            }

        });


        Nil.extend = function () {

            var args = slice.call(arguments),
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

            defaultCreateClass: function () {
                return defaultClassFactory.createClass.apply(defaultClassFactory, arguments);
            },

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

            return new TraitsClassFactory(slice.call(arguments));

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
        define([], factory);
    } else if ( typeof module !== 'undefined' && module.exports ) {
        // Node
        module.exports = factory();
    } else {
        window.barman = factory();
    }

})();