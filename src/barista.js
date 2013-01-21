'use strict';

var _ = require('underscore'),
    bind = _.bind,
    each = _.each,
    isUndefined = _.isUndefined,
    isObject = _.isObject,
    isFunction = _.isFunction,
    extend = _.extend,
    has = _.has,
    toArray = _.toArray,

    getPrototypeOf = Object.getPrototypeOf,
    createObject = Object.create,

    ERROR_MESSAGES = {
        expand: function ( msg, values ) {

            return this[msg].replace(/\{([a-zA-Z0-9]+)\}/g, function ( match, key ) {
                return values[key] || '';
            });

        },

        conflict: 'This property was defined by multiple merged objects, override it with the proper implementation',

        propertyNotDefined: 'The property {name} is not defined',

        required: ''
    },

    CLASS_FACTORY_ATTRIBUTE = '*classFactory*';


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
        throw new ReferenceError(ERROR_MESSAGES.expand('propertyNotDefined', {name: name}));
    }

}


function conflict() {
    throw new Error(ERROR_MESSAGES.conflict);
}


function required() {
    throw new Error(ERROR_MESSAGES.required);
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

        if ( !has(proto, 'constructor') || typeof proto.constructor !== 'function' ) {
            proto.constructor = function () { };
        }

        var ctor = extend(proto.constructor, staticMethods, {__super__: Parent.prototype });

        if ( isUndefined(proto._super) ) { proto._super = Nil.prototype._super; }

        ctor.prototype = proto;
        ctor.extend = Nil.extend;

        return ctor;

    }

});


function createClassOptionsFrom( args ) {

    var options = {classFactory: defaultClassFactory, parent: args[0]},
        i = 1;

    if ( isClassFactory(args[i]) ) { options.classFactory = args[i++]; }
    options.instanceMethods = optional(args[i++]);
    options.staticMethods = optional(args[i]);

    return options;

}


function createClass() {

    var options = createClassOptionsFrom(arguments);

    return options.classFactory.createClass(options.parent, options.instanceMethods, options.staticMethods);

}


Nil.extend = function ( classFactory, instanceMethods, staticMethods ) {

    return createClass(this, classFactory, instanceMethods, staticMethods);

};

var Class = {
    create: function ( classFactory, instanceMethods, staticMethods ) {

        return Nil.extend(classFactory, instanceMethods, staticMethods);

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

module.exports = {
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