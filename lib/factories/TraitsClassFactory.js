'use strict';

var merge = require('../merge'),
    conflict = merge.conflict,

    util = require('../util'),
    each = util.each,
    extend = util.extend,

    AbstractClassFactory = require('./AbstractClassFactory');


var TraitsClassFactory = AbstractClassFactory.extend({

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


module.exports = TraitsClassFactory;