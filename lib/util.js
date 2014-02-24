'use strict';

var
  ArrayProto = Array.prototype,
  nativeForEach = ArrayProto.forEach,
  slice = ArrayProto.slice;


function isUndefined( value ) {
  return typeof value === 'undefined';
}

function isFunction( value ) {
  return typeof value === 'function';
}

function has( object, property ) {
  return object ? Object.prototype.hasOwnProperty.call( object, property ) : false;
}

function isObject( value ) {
  return value === Object( value );
}

function toArray( value ) {
  return slice.call( value );
}

function tail( value ) {
  return slice.call( value, 1 );
}


var JSCRIPT_NON_ENUMERABLE = [ 'constructor', 'hasOwnProperty', 'isPrototypeOf',
  'propertyIsEnumerable', 'toLocaleString', 'toString', 'valueOf'];

function eachKeyStd( obj, func, context ) {
  for ( var key in obj ) {
    func.call( context, obj[ key ], key, obj );
  }
}

function eachKeyFix( obj, func, context ) {
  var i, len;

  eachKeyStd( obj, func, context );

  for ( i = 0, len = JSCRIPT_NON_ENUMERABLE.length; i < len; i++ ) {
    if ( has( obj, JSCRIPT_NON_ENUMERABLE[ i ] ) ) {
      func.call( context, obj[ JSCRIPT_NON_ENUMERABLE[ i ] ], JSCRIPT_NON_ENUMERABLE[ i ], obj );
    }
  }
}

var enumObjectOverrides = (function() {
    var obj = {
      constructor: 1
    };
    for ( var key in obj ) {
      if ( has( obj, key ) ) {
        return true;
      }
    }
    return false;
  })(),
  eachKey = enumObjectOverrides ? eachKeyStd : eachKeyFix;


function each( obj, func, context ) {
  var i, len;

  if ( isUndefined( obj ) || obj === null ) {
    return;
  }

  if ( nativeForEach && obj.forEach === nativeForEach ) {
    obj.forEach( func, context );
  } else if ( obj.length === +obj.length ) {
    for ( i = 0, len = obj.length; i < len; i++ ) {
      func.call( context, obj[ i ], i, obj );
    }
  } else {
    eachKey( obj, func, context );
  }
}


function defineSpecialPropertyStd( obj, name, value ) {
  Object.defineProperty( obj, name, {
    value: value,
    writable: false,
    enumerable: false,
    configurable: false
  } );
  return obj;
}

function defineSpecialPropertyFix( obj, name, value ) {
  obj[ name ] = value;
  return obj;
}

var defineSpecialProperty = isFunction( Object.getOwnPropertyNames ) ?
  defineSpecialPropertyStd : defineSpecialPropertyFix;

var isArray = isFunction( Array.isArray ) ? Array.isArray : function( value ) {
    var toString = Object.prototype.toString;
    return toString.call( value ) === '[object Array]';
  };


function _flatten( result, array ) {
  var
    length = array.length,
    value = null;

  for (var i = 0; i < length; i++) {
    value = array[i];

    if ( isArray(value) ) {
      _flatten( result, value );
    } else {
      result.push(value);
    }
  }

  return result;
}

function flatten( array ) {
  return _flatten([], array);
}


module.exports = {
  defineSpecialProperty: defineSpecialProperty,
  each: each,
  flatten: flatten,
  has: has,
  isArray: isArray,
  isFunction: isFunction,
  isObject: isObject,
  isUndefined: isUndefined,
  tail: tail,
  toArray: toArray
};