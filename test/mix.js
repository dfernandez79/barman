'use strict';

var
  expect = require('expect.js'),
  mix = require('../lib').mix,

  ifGetPrototypeOfIsSupportedIt = Object.getPrototypeOf ? it : it.skip;


describe( 'mix', function() {

  ifGetPrototypeOfIsSupportedIt( 'uses the parent as prototype', function() {
    var
      parent = {},
      result = mix(parent, {});

    expect( Object.getPrototypeOf( result ) ).to.equal( parent );

  });


  it( 'merges traits into the object', function () {
    var
      result = mix([{one: 1}, {two: 2}], {});

    expect( result.one ).to.equal( 1 );
    expect( result.two ).to.equal( 2 );

  });


  it( 'overwrites conflicts', function () {
    var
      result = mix([{value: 1}, {value: 2}], {value: 3});

    expect( result.value ).to.equal( 3 );

  });

});