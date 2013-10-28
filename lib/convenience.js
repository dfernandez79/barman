'use strict';

var core = require('./core'),
    util = require('./util'),

    Nil = core.Nil,
    markAsClassFactory = core.markAsClassFactory,
    TraitsClassFactory = core.TraitsClassFactory,

    toArray = util.toArray,
    tail = util.tail;


var Class = {
    create: function () {
        return Nil.extend.apply(Nil, arguments);
    }
};

function subclassOf( Parent ) {
    return Nil.extend.apply(Parent, tail(arguments));
}

function include() {
    return new TraitsClassFactory(toArray(arguments));
}

function createClass() {
    return Class.create.apply(Class, arguments);
}

var inheritsAdapterClassFactory = markAsClassFactory({
    createClass: function ( Parent ) {
        var NewClass = subclassOf.apply(null, arguments);
        NewClass.super_ = Parent;
        return NewClass;
    }
});

function useInheritsAdapter() {
    return inheritsAdapterClassFactory;
}

module.exports = {
    Class: Class,
    createClass: createClass,
    include: include,
    subclassOf: subclassOf,
    useInheritsAdapter: useInheritsAdapter
};


