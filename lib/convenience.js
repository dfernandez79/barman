'use strict';

var Nil = require('./core').Nil,
    factories = require('./factories'),

    TraitsClassFactory = factories.TraitsClassFactory,
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


module.exports = {
    Class: Class,
    subclassOf: subclassOf,
    include: include
};


