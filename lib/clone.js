'use strict';

var
  util = require('./util'),
  has = util.has,
  isUndefined = util.isUndefined;


function cloneUsingObjectCreate( obj ) {
  if ( isUndefined( obj ) ) {
    return obj;
  }
  return Object.create( obj );
}

function cloneUsingNew( obj ) {
  if ( isUndefined( obj ) ) {
    return obj;
  }

  function Empty() {}

  Empty.prototype = obj;
  return new Empty();
}

var clone = has( Object, 'create' ) ?
  cloneUsingObjectCreate :
  cloneUsingNew;


module.exports = clone;