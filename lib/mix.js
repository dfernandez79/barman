'use strict';

var
  merge = require('./merge'),
  clone = require('./clone'),
  extend = require('./extend'),

  util = require('./util'),
  isArray = util.isArray,
  isObject = util.isObject;


function _mix( parent, traits, spec ) {
  var
    result = extend( clone( parent ), merge( traits ), spec );

  merge.assertNoConflict( result );

  return result;
}

function mix() {
  var
    argsShift = 0,
    parent = {},
    traits = [];

  if ( arguments.length > 1 && 
      isObject( arguments[ argsShift ] ) && 
      !isArray( arguments[ argsShift ] ) ) {
    parent = arguments[ argsShift++ ];
  }

  if ( isArray( arguments[ argsShift ] ) ) {
    traits = arguments[ argsShift++ ];
  }

  return _mix( parent, traits, arguments[ argsShift ] );
}


module.exports = mix;