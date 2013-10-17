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