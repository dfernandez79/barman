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