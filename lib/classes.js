'use strict';

var
  extend = require('./extend'),
  mix = require('./mix'),

  util = require('./util'),
  defineSpecialProperty = util.defineSpecialProperty,
  has = util.has,
  isFunction = util.isFunction,
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
    argShift = 0,
    parent = Nil,
    traits = [];

  if ( isFunction( arguments[ argShift ] ) ) {
    parent = arguments[ argShift++ ];
  }

  if ( isArray( arguments[ argShift ] ) ) {
    traits = arguments[ argShift++ ];
  }

  return _newclass( parent, traits, 
    arguments[ argShift ], arguments[ argShift + 1 ] );
}


Nil.extend = function() {
  var args = Array.prototype.slice.call( arguments );
  args.unshift( this );
  return newclass.apply( null, args );
};


module.exports = {
  newclass: newclass,
  Nil: Nil
};