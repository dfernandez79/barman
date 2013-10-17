(function(e){if("function"==typeof bootstrap)bootstrap("barman",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeBarman=e}else"undefined"!=typeof window?window.barman=e():global.barman=e()})(function(){var define,ses,bootstrap,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var core = require('./core'),

    Nil = core.Nil,
    TraitsClassFactory = core.TraitsClassFactory,

    slice = Array.prototype.slice;


var Class = {
    create: function () {
        return Nil.extend.apply(Nil, arguments);
    }
};

function subclassOf( Parent ) {
    return Nil.extend.apply(Parent, slice.call(arguments, 1));
}

function include() {
    return new TraitsClassFactory(slice.call(arguments));
}

function createClass() {
    return Class.create.apply(Class, arguments);
}


module.exports = {
    Class: Class,
    subclassOf: subclassOf,
    include: include,
    createClass: createClass
};



},{"./core":2}],2:[function(require,module,exports){
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


var AbstractClassFactory = defaultClassFactory.createClass(Nil, {

    defaultCreateClass: function () {
        return defaultClassFactory.createClass.apply(defaultClassFactory, arguments);
    },

    createClass: required

});
markAsClassFactory(AbstractClassFactory.prototype);


var TraitsClassFactory = defaultClassFactory.createClass(AbstractClassFactory, {

    constructor: function ( traits ) {
        this.traits = traits;
    },

    createClass: function ( Parent, instanceMethods, staticMethods ) {

        var traitComposition = merge.apply(null, this.traits),
            newClass = this.defaultCreateClass(Parent, extend(traitComposition, instanceMethods), staticMethods);

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

Nil.extend = function () {
    var args = slice.call(arguments), classFactory = defaultClassFactory;

    if (isClassFactory(args[0])) {
        classFactory = args.shift();
    } else if (isArray(args[0])) {
        classFactory = new TraitsClassFactory(args.shift());
    }

    args.unshift(this);

    return classFactory.createClass.apply(classFactory, args);
};
AbstractClassFactory.extend = Nil.extend;
TraitsClassFactory.extend = Nil.extend;


module.exports = {
    Nil: Nil,
    defaultClassFactory: defaultClassFactory,
    markAsClassFactory: markAsClassFactory,
    isClassFactory: isClassFactory,

    AbstractClassFactory: AbstractClassFactory,
    TraitsClassFactory: TraitsClassFactory
};
},{"./merge":4,"./util":5}],3:[function(require,module,exports){
'use strict';

var convenience = require('./convenience'),
    core = require('./core'),
    merge = require('./merge'),
    util = require('./util');


module.exports = {
    Nil: core.Nil,
    markAsClassFactory: core.markAsClassFactory,
    isClassFactory: core.isClassFactory,
    defaultClassFactory: core.defaultClassFactory,
    AbstractClassFactory: core.AbstractClassFactory,

    clone: util.clone,
    extend: util.extend,

    merge: merge,
    conflict: merge.conflict,
    required: merge.required,

    Class: convenience.Class,
    subclassOf: convenience.subclassOf,
    include: convenience.include,
    createClass: convenience.createClass
};

},{"./convenience":1,"./core":2,"./merge":4,"./util":5}],4:[function(require,module,exports){
'use strict';

var util = require('./util'),

    each = util.each,
    isUndefined = util.isUndefined,
    has = util.has;


function mapProperties( srcObj, iterator, result ) {
    if ( !result || !srcObj ) { result = {}; }

    each(srcObj, function ( value, prop ) {
        result[prop] = iterator.call(this, value, prop);
    }, result);

    return result;
}


function conflict() {
    throw new Error(
        'This property was defined by multiple merged objects, override it with the proper implementation');
}

function required() {
    throw new Error('An implementation is required');
}

function valueHasPrecedence( thisValue, value ) {
    return isUndefined(thisValue) || thisValue === value || thisValue === required;
}

function mergeProperty( value, prop ) {
    /*jshint validthis:true */
    var thisValue = has(this, prop) ? this[prop] : undefined;

    if ( valueHasPrecedence(thisValue, value) ) {
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
merge.required = required;
merge.conflict = conflict;


module.exports = merge;
},{"./util":5}],5:[function(require,module,exports){
'use strict';

var ArrayProto = Array.prototype,
    nativeForEach = ArrayProto.forEach,
    slice = ArrayProto.slice;


function isUndefined( value ) {
    return typeof value === 'undefined';
}

function isFunction( value ) {
    return typeof value === 'function';
}

function has( object, property ) {
    return object ? Object.prototype.hasOwnProperty.call(object, property) : false;
}

function isObject( value ) {
    return value === Object(value);
}


var JSCRIPT_NON_ENUMERABLE = [ 'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
                               'toLocaleString', 'toString', 'valueOf' ];

function eachKeyStd( obj, func, context ) {
    for ( var key in obj ) {
        func.call(context, obj[key], key, obj);
    }
}

function eachKeyFix( obj, func, context ) {
    var i, len;

    eachKeyStd(obj, func, context);

    for ( i = 0, len = JSCRIPT_NON_ENUMERABLE.length; i < len; i++ ) {
        if ( has(obj, JSCRIPT_NON_ENUMERABLE[i]) ) {
            func.call(context, obj[JSCRIPT_NON_ENUMERABLE[i]], JSCRIPT_NON_ENUMERABLE[i], obj);
        }
    }
}

var enumObjectOverrides = (function () {
        var obj = {constructor: 1};
        for ( var key in obj ) { if ( has(obj, key) ) { return true; } }
        return false;
    })(),
    eachKey = enumObjectOverrides ? eachKeyStd : eachKeyFix;


function each( obj, func, context ) {
    var i, len;

    if ( obj === null ) {
        return;
    }

    if ( nativeForEach && obj.forEach === nativeForEach ) {
        obj.forEach(func, context);
    } else if ( obj.length === +obj.length ) {
        for ( i = 0, len = obj.length; i < len; i++ ) {
            func.call(context, obj[i], i, obj);
        }
    } else {
        eachKey(obj, func, context);
    }
}

function extend( obj ) {
    each(slice.call(arguments, 1), function ( source ) {
        if ( source ) {
            each(source, function ( value, prop ) { obj[prop] = value; });
        }
    });
    return obj;
}

var clone = has(Object, 'create') ? Object.create : function ( proto ) {
    function Empty() {}

    Empty.prototype = proto;
    return new Empty();
};


function defineSpecialPropertyStd( obj, name, value ) {
    Object.defineProperty(obj, name, {value: value, writable: false, enumerable: false, configurable: false});
    return obj;
}

function defineSpecialPropertyFix( obj, name, value ) {
    obj[name] = value;
    return obj;
}

var defineSpecialProperty = isFunction(Object.getOwnPropertyNames) ?
    defineSpecialPropertyStd : defineSpecialPropertyFix;

var isArray = isFunction(Array.isArray) ? Array.isArray : function ( value ) {
    var toString = Object.prototype.toString;
    return toString.call(value) === '[object Array]';
};


module.exports = {
    isArray: isArray,
    isUndefined: isUndefined,
    isFunction: isFunction,
    has: has,
    isObject: isObject,
    each: each,
    extend: extend,
    clone: clone,
    defineSpecialProperty: defineSpecialProperty
};
},{}]},{},[3])
(3)
});
;