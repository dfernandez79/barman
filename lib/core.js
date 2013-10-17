'use strict';

var util = require('./util'),

    clone = util.clone,
    defineSpecialProperty = util.defineSpecialProperty,
    extend = util.extend,
    has = util.has,
    isFunction = util.isFunction,
    isObject = util.isObject,

    slice = Array.prototype.slice,

    CLASS_FACTORY_ATTRIBUTE = '*classFactory*';


function markAsClassFactory( obj ) {
    return defineSpecialProperty(obj, CLASS_FACTORY_ATTRIBUTE, true);
}

function isClassFactory( obj ) {
    return isObject(obj) && obj[CLASS_FACTORY_ATTRIBUTE] === true;
}


function Nil() { }
defineSpecialProperty(Nil, '__super__', Nil.prototype);


var defaultClassFactory = markAsClassFactory({
    createClass: function ( Parent, instanceMethods, staticMethods ) {
        return this._createClassConstructorFunction(
            this._createPrototype(Parent, instanceMethods),
            staticMethods,
            Parent);
    },

    _createPrototype: function ( Parent, instanceMethods ) {
        var proto = extend(clone(Parent.prototype), instanceMethods);

        if ( !has(proto, 'constructor') ) {
            proto.constructor = function () { Parent.apply(this, arguments); };
        } else if ( !isFunction(proto.constructor) ) {
            throw new TypeError('The constructor property must be a function');
        }
        return proto;
    },

    _createClassConstructorFunction: function ( proto, staticMethods, Parent ) {
        var ctor = extend(proto.constructor, staticMethods);
        defineSpecialProperty(ctor, '__super__', Parent.prototype);
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


module.exports = {
    Nil: Nil,
    defaultClassFactory: defaultClassFactory,
    markAsClassFactory: markAsClassFactory,
    isClassFactory: isClassFactory
};