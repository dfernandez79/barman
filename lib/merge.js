'use strict';

var
  util = require('./util'),
  each = util.each,
  flatten = util.flatten,
  has = util.has,
  isUndefined = util.isUndefined;


function required() {
  throw new Error('An implementation is required');
}

function conflict() {
  throw new Error('This property was defined by multiple merged objects, override it with the proper implementation');
}


function mapProperties( srcObj, iterator, result ) {
  each( srcObj, function( value, prop ) {
    result[ prop ] = iterator.call( this, value, prop );
  }, result);

  return result;
}

function valueHasPrecedence( thisValue, value ) {
  return isUndefined( thisValue ) || thisValue === value || thisValue === required;
}

function mergeProperty( value, prop ) {
  /*jshint validthis:true */
  var thisValue = has( this, prop ) ? this[ prop ] : undefined;

  if ( valueHasPrecedence( thisValue, value ) ) {
    return value;

  } else if ( value === required ) {
    return thisValue;

  } else {
    return conflict;
  }
}


function merge() {
  var result = {};

  each( flatten( arguments ), function( obj ) {
    mapProperties( obj, mergeProperty, result );
  } );

  return result;
}

merge.required = required;
merge.conflict = conflict;
merge.assertNoConflict = function ( obj ) {
  var conflicts = [];

  each( obj, function( value, name ) {
    if ( value === merge.conflict ) {
      conflicts.push( name );
    }
  });

  if ( conflicts.length > 0 ) {
    throw new Error( 'There is a merge conflict for the following properties: ' +
      conflicts.sort().join( ',' ) );
  }
};


module.exports = merge;