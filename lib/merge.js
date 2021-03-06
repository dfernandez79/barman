'use strict';

var
  util = require('./util'),
  each = util.each,
  has = util.has,
  eachKey = util.eachKey,
  isUndefined = util.isUndefined,
  flatten = util.flatten;

///////////////
function propertyDescriptor( obj, prop ) {
  var 
    target = obj,
    getproto = Object.getPrototypeOf;

  while ( target !== Object.prototype && !has( target, prop ) ) {
    target = getproto(target);
  }

  return target === Object.prototype ? undefined : Object.getOwnPropertyDescriptor(target, prop);
}

function defineProperty( obj, prop, descriptor ) {
  if (descriptor.writable && descriptor.enumerable && descriptor.configurable && !descriptor.get && !descriptor.set) {
    obj[prop] = descriptor.value;
  } else {
    Object.defineProperty(obj, prop, descriptor);
  }
}

function eachPropertyDescriptor( obj, iterator ) {
  if ( obj ) {
    for (var key in obj) {
      iterator( propertyDescriptor(obj, key), key );
    }
  }
}

function sameDescriptor( a, b ) {
  return a.value === b.value &&
    a.writable === b.writable &&
    a.get === b.get &&
    a.set === b.set &&
    a.configurable === b.configurable &&
    a.enumerable === b.enumerable;
}
//////////////

function required() {
  throw new Error('An implementation is required');
}

function conflict() {
  throw new Error('This property was defined by multiple merged objects, override it with the proper implementation');
}

//////
function describesRequiredProperty( descriptor ) {
  return isUndefined(descriptor) || descriptor.value === required;
}

//////

function mergeProperty( result, prop, descriptor ) {
  var resPropDescriptor = propertyDescriptor( result, prop );

  if ( resPropDescriptor && 
    !describesRequiredProperty( resPropDescriptor ) &&
    !describesRequiredProperty( descriptor ) && 
    !sameDescriptor( descriptor, resPropDescriptor) ) {

    result[ prop ] = conflict;

  } else if (describesRequiredProperty( resPropDescriptor )) {
    defineProperty( result, prop, descriptor );
  }
}

function mergeProperties( result, srcObj ) {
  eachPropertyDescriptor( srcObj, function( descriptor, prop ) {
    mergeProperty( result, prop, descriptor );
  });

  return result;
}


function merge() {
  var result = {};

  each( flatten( arguments ), function( obj ) {
    mergeProperties( result, obj );
  } );

  return result;
}

merge.required = required;
merge.conflict = conflict;
merge.assertNoConflict = function ( obj ) {
  var conflicts = [];

  eachKey( obj, function( value, name ) {
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