'use strict';

var merge = require('./merge'),
    conflict = merge.conflict,

    util = require('./util'),
    each = util.each,
    extend = util.extend;    


module.exports = function ( Nil ) {
    
    function include() {
        var traitComposition = merge.apply(null, arguments);

        return function ( Parent, instanceMethods, staticMethods ) {
            var newClass = Nil.extend.call(
                    Parent, 
                    extend(traitComposition, instanceMethods), 
                    staticMethods);

            assertNoConflict(newClass.prototype);

            return newClass;
        };
    }

    function assertNoConflict( obj ) {
        var conflicts = [];
        each(obj, function ( value, name ) { if ( value === conflict ) { conflicts.push(name); } });

        if ( conflicts.length > 0 ) {
            throw new Error('There is a merge conflict for the following properties: ' +
                conflicts.sort().join(','));
        }
    }

    return include;
};