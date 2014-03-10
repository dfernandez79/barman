'use strict';

var
  util = require('./util'),
  has = util.has,
  isUndefined = util.isUndefined;


var _clone = has( Object, 'create' ) ?
  Object.create :
  function ( obj ) {
    function Empty() {}

    Empty.prototype = obj;
    return new Empty();
  };

function clone( obj ) {
  return isUndefined( obj ) ? obj : _clone( obj );
}


module.exports = clone;