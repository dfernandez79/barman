'use strict';

var merge = require('./merge'),

    util = require('./util'),
    defineSpecialProperty = util.defineSpecialProperty,
    isArray = util.isArray,
    isFunction = util.isFunction,
    toArray = util.toArray,

    Nil = function () { },
    basicCreateClass = require('./classes')(Nil),
    include = require('./traits')(Nil);


defineSpecialProperty(Nil, '__super__', Nil.prototype);

function subclassOf() {
    var args = toArray(arguments),
        classFactory = basicCreateClass;

    if (isFunction(args[1])) {
        classFactory = args.splice(1, 1)[0];
    } else if (isArray(args[1])) {
        classFactory = include.apply(null, args.splice(1, 1)[0]);
    }

    return classFactory.apply(null, args);    
}

Nil.extend = function () {
    var args = toArray(arguments);
    args.unshift(this);

    return subclassOf.apply(null, args);
};

function createClass() {
    return Nil.extend.apply(Nil, arguments);
}


module.exports = {
    Nil: Nil,
    subclassOf: subclassOf,
    createClass: createClass,
    include: include,

    merge: merge,
    conflict: merge.conflict,
    required: merge.required,

    clone: util.clone,
    extend: util.extend
};