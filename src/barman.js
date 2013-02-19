(function () {

    'use strict';

    function factory() {

        var ArrayProto = Array.prototype,
            ObjectProto = Object.prototype,
            nativeForEach = ArrayProto.forEach,
            slice = ArrayProto.slice,

            getPrototypeOf = Object.getPrototypeOf,
            createObject = Object.create,

            CLASS_FACTORY_ATTRIBUTE = '*classFactory*';


        function has( object, property ) {
            return object ? ObjectProto.hasOwnProperty.call(object, property) : false;
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


        // This each implementation is based on the source code of underscore.js
        // It doesn't comply with the specification at http://es5.github.com/#x15.4.4.18 but is enough for the purposes
        // of this library.
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
                throw new ReferenceError('The property ' + name + ' is not defined');
            }

        }


        function conflict() {

            throw new Error(
                'This property was defined by multiple merged objects, override it with the proper implementation');

        }


        function required() {

            throw new Error('An implementation is required');

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
                superPrototype = getPrototypeOf(thisPrototype),
                self = this;

            if ( !methodName ) {
                return superPrototype;
            } else {
                var superProp = superPrototype[methodName];
                assertDefinedProperty(superProp, methodName);

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