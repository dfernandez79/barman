'use strict';

var
  expect = require('expect.js'),
  clone = require('../lib').clone;


describe('clone', function() {

  it('returns undefined when undefined is given', function() {

    expect( clone(undefined) ).to.equal( undefined );

  });

});