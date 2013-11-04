'use strict';

var util = require('./util'),
    clone = util.clone,
    defineSpecialProperty = util.defineSpecialProperty,
    extend = util.extend,
    has = util.has,
    isFunction = util.isFunction;


module.exports = function ( Nil ) {

    function basicCreateClass( Parent, instanceMethods, staticMethods ) {
        return createConstructor(
            Parent,
            createPrototype(Parent, instanceMethods),
            staticMethods);
    }

    function createConstructor( Parent, proto, staticMethods ) {
        var ctor = extend(proto.constructor, staticMethods);

        defineSpecialProperty(ctor, '__super__', Parent.prototype);
        ctor.prototype = proto;
        ctor.extend = Nil.extend;

        return ctor;
    }

    function createPrototype( Parent, instanceMethods ) {
        var proto = extend(clone(Parent.prototype), instanceMethods);

        if ( !has(proto, 'constructor') ) {
            proto.constructor = function () { Parent.apply(this, arguments); };
        } else if ( !isFunction(proto.constructor) ) {
            throw new TypeError('The constructor property must be a function');
        }

        return proto;
    }

    return basicCreateClass;
};

