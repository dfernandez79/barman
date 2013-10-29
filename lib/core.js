'use strict';

var util = require('./util'),
    merge = require('./merge'),

    required = merge.required,
    conflict = merge.conflict,

    clone = util.clone,
    defineSpecialProperty = util.defineSpecialProperty,
    each = util.each,
    extend = util.extend,
    has = util.has,
    isArray = util.isArray,
    isFunction = util.isFunction,
    isObject = util.isObject,
    toArray = util.toArray,

    CLASS_FACTORY_ATTRIBUTE = '*classFactory*',

    defaultClassFactory = {},
    TraitsClassFactory = function () {};


function classFactory( obj ) {
    return defineSpecialProperty(obj, CLASS_FACTORY_ATTRIBUTE, true);
}

function isClassFactory( obj ) {
    return isObject(obj) && obj[CLASS_FACTORY_ATTRIBUTE] === true;
}


function Nil() { }
defineSpecialProperty(Nil, '__super__', Nil.prototype);

Nil.extend = function () {
    var args = toArray(arguments), classFactory = defaultClassFactory;

    if (isClassFactory(args[0])) {
        classFactory = args.shift();
    } else if (isArray(args[0])) {
        classFactory = new TraitsClassFactory(args.shift());
    }

    args.unshift(this);

    return classFactory.createClass.apply(classFactory, args);
};


defaultClassFactory = classFactory({
    createClass: function ( Parent, instanceMethods, staticMethods ) {
        return this._createClassConstructorFunction(
            Parent,
            this._createPrototype(Parent, instanceMethods),
            staticMethods);
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

    _createClassConstructorFunction: function ( Parent, proto, staticMethods ) {
        var ctor = extend(proto.constructor, staticMethods);

        defineSpecialProperty(ctor, '__super__', Parent.prototype);
        ctor.prototype = proto;
        ctor.extend = Nil.extend;

        return ctor;
    }
});


var AbstractClassFactory = Nil.extend({

    createClass: required

});
classFactory(AbstractClassFactory.prototype);


TraitsClassFactory = AbstractClassFactory.extend({
    constructor: function ( traits ) {
        this.traitComposition = merge.apply(null, traits);
    },

    createClass: function ( Parent, instanceMethods, staticMethods ) {
        var newClass = defaultClassFactory.createClass(
            Parent, 
            extend(this.traitComposition, instanceMethods), 
            staticMethods);

        this._assertNoConflict(newClass.prototype);

        return newClass;

    },

    _assertNoConflict: function ( obj ) {
        var conflicts = [];
        each(obj, function ( value, name ) { if ( value === conflict ) { conflicts.push(name); } });

        if ( conflicts.length > 0 ) {
            throw new Error('There is a merge conflict for the following properties: ' +
                conflicts.sort().join(','));
        }
    }
});


module.exports = {
    Nil: Nil,
    defaultClassFactory: defaultClassFactory,
    classFactory: classFactory,
    isClassFactory: isClassFactory,

    AbstractClassFactory: AbstractClassFactory,
    TraitsClassFactory: TraitsClassFactory
};