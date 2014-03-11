'use strict';

var
  expect = require('expect.js'),
  barman = require('../lib'),
  clone = barman.clone,
  extend = barman.extend,

  merge = barman.merge,
  required = merge.required,
  conflict = merge.conflict,

  ifSettersAndGettersIsSupportedDescribe = Object.defineProperties ?
    describe : describe.skip;


describe('merge', function() {

  it('merges given properties into a new object', function() {
    var
      one = {one: 'prop from one'},
      two = {two: 'prop from two'},

      result = merge( one, two );

    expect( result ).to.not.equal( one );
    expect( result ).to.not.equal( two );
    expect( result.one ).to.equal( one.one );
    expect( result.two ).to.equal( two.two );

  });


  it('marks conflicting properties', function() {
    var
      result = merge( {prop: 'prop from one'}, {prop: 'prop from two'} );

    expect( result.prop ).to.equal( conflict );

  });


  it('accepts properties that has the same value', function() {

    expect( merge( {prop: 'value'}, {prop: 'value'} ).prop ).to.equal( 'value' );

  });


  it('accepts implementations for properties marked as required', function() {

    expect( merge( {prop: required}, {prop: 'value'} ).prop ).to.equal( 'value' );

  });


  it('does not generate conflicts with Object built-in methods', function() {
    var
      result = merge( {
        toString: function() {
          return 'hello';
        }
      }, {
        other: true
      });

    expect( result.toString() ).to.equal( 'hello' );

  });


  it('generates conflicts if an Object built-in has been already defined', function() {
    var
      result = merge( {
        toString: function() {
          return 'hello';
        }
      }, {
        toString: function() {
          return 'hello';
        }
      });

    expect( result.toString ).to.throwError();

  });


  it('accepts a redefinition of constructor', function() {
    var
      Some = merge( {
        constructor: function() {
          this.x = 10;
        }
      }, {
        toString: function() {
          return 'hello';
        }
      }),

      result = new Some.constructor();

    expect( result.x ).to.equal( 10 );
    expect( Some.toString() ).to.equal( 'hello' );

  });


  it('merges non-owned properties', function() {
    var
      proto = {value: 'hello'},
      other = clone( proto ),
      merged = merge( {one: 1}, other );

    expect( other.hasOwnProperty( 'value' ) ).to.equal( false );
    expect( merged.hasOwnProperty( 'one' ) ).to.equal( true );
    expect( merged.hasOwnProperty( 'value' ) ).to.equal( true );
    expect( merged.value ).to.equal( 'hello' );

  });


  it('flattens methods from prototype', function() {
    var
      proto = {value: 'hello'},
      one = extend( clone( proto ), {one: 1} ),
      two = extend( clone( proto ), {two: 2} ),

      merged = merge( one, two );

    expect( merged.hasOwnProperty( 'value' ) );
    expect( merged.value ).to.equal( 'hello' );

  });


  it('ignores undefined objects', function() {

    expect( merge( {hello: 'world'}, undefined ) ).to.eql( {hello: 'world'} );

  });


  it('ignores a required property that has been set', function() {

    expect( merge( {prop: 'value'}, {prop: required} ).prop ).to.equal( 'value' );

  });


  it('provides an assertion function to verify that an object do not contains any conflict', function() {

    expect( function() {

      merge.assertNoConflict( {
        value: conflict
      });

    }).to.throwError();

  });


  it('accepts an array of objects', function () {
    var
      one = {one: 'prop from one'},
      two = {two: 'prop from two'},

      result = merge( [one, two] );

    expect( result.one ).to.equal( one.one );
    expect( result.two ).to.equal( two.two );

  });


  it('flattens multiple arrays', function () {
    var
      one = {one: 'prop from one'},
      two = {two: 'prop from two'},
      three = {three: 'prop from three'},

      result = merge( [one, [two]], [three] );

    expect( result.one ).to.equal( one.one );
    expect( result.two ).to.equal( two.two );
    expect( result.three ).to.equal( three.three );

  });


  ifSettersAndGettersIsSupportedDescribe('setters and setters compatibility', function () {


    it('only takes enumerable properties into account', function () {
      var obj = {};

      Object.defineProperty(obj, 'val', {value: 1});

      expect( obj.val ).to.be(1);
      expect( merge({}, obj) ).to.eql({});

    });


    it('merges enumerable properties with the same getter and setter functions', function () {
      var
        one = {},
        two = {},
        getValue = function () { return 1; },
        setValue = function (v) { return v; };

      Object.defineProperty(one, 'value', {
        get: getValue, 
        set: setValue,
        enumerable: true
      });
      Object.defineProperty(two, 'value', {
        get: getValue, 
        set: setValue,
        enumerable: true
      });

      var
        result = merge( one, two ),
        valueDescriptor = Object.getOwnPropertyDescriptor(result, 'value');

      expect( result.value ).to.be(1);
      expect( valueDescriptor.get ).to.be(getValue);
      expect( valueDescriptor.set ).to.be(setValue);

    });

  });

  describe('merge.conflict', function () {

    it('throws an error when executed', function () {
      expect(conflict).to.throwError();
    });

  });


  describe('merge.required', function () {

    it('throws an error when executed', function () {
      expect(required).to.throwError();
    });

  });

});