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

