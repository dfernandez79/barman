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