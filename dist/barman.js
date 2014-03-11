!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.barman=e():"undefined"!=typeof global?global.barman=e():"undefined"!=typeof self&&(self.barman=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var
  extend = require('./extend'),
  mix = require('./mix'),

  util = require('./util'),
  defineSpecialProperty = util.defineSpecialProperty,
  has = util.has,
  isFunction = util.isFunction,
  isArray = util.isArray,  
  toArray = util.toArray;


function Nil() {}
defineSpecialProperty(Nil, '__super__', Nil.prototype);


function ensureConstructor( parent, proto ) {

  if ( !has( proto, 'constructor' ) ) {
    proto.constructor = function() {
      parent.apply( this, arguments );
    };

  } else if ( !isFunction( proto.constructor ) ) {
    throw new TypeError( 'The constructor property must be a function' );
  }

  return proto;
}

function _newclass( parent, traits, spec, classMethods ) {
  var
    proto = ensureConstructor(parent, mix( parent.prototype, traits, spec )),

    ctor = extend( proto.constructor, classMethods );

  defineSpecialProperty( ctor, '__super__', parent.prototype );
  defineSpecialProperty( ctor, 'super_', parent );

  ctor.prototype = proto;
  ctor.extend = Nil.extend;

  return ctor;
}

function newclass() {
  var
    args = toArray( arguments ),
    parent = Nil,
    traits = [];

  if ( isFunction( args[ 0 ] ) ) {
    parent = args.shift();
  }

  if ( isArray( args[ 0 ] ) ) {
    traits = args.shift();
  }

  return _newclass( parent, traits, args[ 0 ], args[ 1 ] );
}


Nil.extend = function() {
  var args = toArray( arguments );
  args.unshift( this );
  return newclass.apply( null, args );
};


module.exports = {
  newclass: newclass,
  Nil: Nil
};
},{"./extend":3,"./mix":6,"./util":7}],2:[function(require,module,exports){
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
},{"./util":7}],3:[function(require,module,exports){
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
},{"./util":7}],4:[function(require,module,exports){
'use strict';

var
  classes = require( './classes' ),
  merge = require( './merge' );


module.exports = {
  Nil: classes.Nil,
  newclass: classes.newclass,

  merge: merge,
  conflict: merge.conflict,
  required: merge.required,

  clone: require( './clone' ),
  extend: require( './extend' ),
  mix: require( './mix' )
};
},{"./classes":1,"./clone":2,"./extend":3,"./merge":5,"./mix":6}],5:[function(require,module,exports){
'use strict';

var
  util = require('./util'),
  each = util.each,
  isUndefined = util.isUndefined,
  flatten = util.flatten;

///////////////
function propertyDescriptor( obj, prop ) {
  var 
    descriptor = null,
    target = obj,
    objProto = Object.prototype;

  do {
    descriptor = Object.getOwnPropertyDescriptor(target, prop);
    target = Object.getPrototypeOf(target);
  } while (!descriptor && target !== objProto);

  return descriptor;
}

function defineProperty( obj, prop, descriptor ) {
  Object.defineProperty(obj, prop, descriptor);
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
},{"./util":7}],6:[function(require,module,exports){
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
    result = extend( clone( parent ), merge( traits ), spec );

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
},{"./clone":2,"./extend":3,"./merge":5,"./util":7}],7:[function(require,module,exports){
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
},{}]},{},[4])
(4)
});
;