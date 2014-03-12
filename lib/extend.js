'use strict';

var
  util = require('./util'),
  eachKey = util.eachKey;


function extend( obj ) {
  var source;

  function setObjProp( value, prop ) {
    obj[ prop ] = value;
  }

  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];

    if ( source ) {
      eachKey( source, setObjProp );
    }
  }

  return obj;
}


module.exports = extend;