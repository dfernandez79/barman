'use strict';

var
  merge = require('./merge'),
  clone = require('./clone'),
  extend = require('./extend'),

  util = require('./util'),
  isArray = util.isArray,
  isObject = util.isObject,
  toArray = util.toArray;


function _mix( parent, traits, spec ) {
  var
    traitComposition = merge.apply( null, traits ),
    result = extend( clone( parent ), traitComposition, spec );

  merge.assertNoConflict( result );

  return result;
}

function mix() {
  var
    args = toArray( arguments ),
    parent = {},
    traits = [];

  if ( args.length > 1 && isObject( args[ 0 ] ) && !isArray( args[ 0 ] ) ) {
    parent = args.shift();
  }

  if ( isArray( args[ 0 ] ) ) {
    traits = args.shift();
  }

  return _mix( parent, traits, args[ 0 ] );
}


module.exports = mix;