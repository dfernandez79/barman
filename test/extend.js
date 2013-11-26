'use strict';

var
  expect = require('expect.js'),
  clone = require('../lib').clone,
  extend = require('../lib').extend;


describe('extend', function() {

  it('copies not owned properties', function() {
    var
      proto = {
        value: 'hello'
      },
      obj = clone( proto ),
      extended = extend( {}, obj );

    expect( obj.hasOwnProperty( 'value' ) ).to.equal( false );
    expect( extended.hasOwnProperty( 'value' ) ).to.equal( true );
    expect( extended.value ).to.equal( 'hello' );

  });


  it('adds new fields', function() {
    var
      extended = extend( {one: 1}, {two: 2} );

    expect( extended.one ).to.equal( 1 );
    expect( extended.two ).to.equal( 2 );

  });


  it('overwrites existing fields', function() {

    expect( extend( {value: 1}, {value: 2} ).value ).to.equal( 2 );

  });


  it('returns the first argument existing fields', function() {
    var
      obj = {value: 1};

    expect( extend( obj ) ).to.equal( obj );

  });

});