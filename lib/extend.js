'use strict';

var
  util = require('./util'),
  each = util.each,
  tail = util.tail;


function extend( obj ) {
  each( tail( arguments ), function( source ) {
    if ( source ) {
      each( source, function( value, prop ) {
        obj[ prop ] = value;
      });
    }
  });

  return obj;
}


module.exports = extend;