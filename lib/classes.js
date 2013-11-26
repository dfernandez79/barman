'use strict';

var
  extend = require('./extend'),
  mix = require('./mix'),

  util = require('./util'),
  defineSpecialProperty = util.defineSpecialProperty,
  has = util.has,
  isFunction = util.isFunction,
  toArray = util.toArray,
  isArray = util.isArray;


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

function _newclass( parent, traits, spec, funcMethods ) {
  var
    proto = ensureConstructor(parent, mix( parent.prototype, traits, spec )),

    ctor = extend( proto.constructor, funcMethods );

  defineSpecialProperty( ctor, '__super__', parent.prototype );
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