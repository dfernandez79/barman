'use strict';

var required = require('../merge').required,

    core = require('../core'),
    Nil = core.Nil,
    defaultClassFactory = core.defaultClassFactory,
    markAsClassFactory = core.markAsClassFactory;


var AbstractClassFactory = Nil.extend({

    defaultCreateClass: function () {
        return defaultClassFactory.createClass.apply(defaultClassFactory, arguments);
    },

    createClass: required

});
markAsClassFactory(AbstractClassFactory.prototype);


module.exports = AbstractClassFactory;