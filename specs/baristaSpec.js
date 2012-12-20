var should = require('chai').should(),
    Barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    it('provides a Class object', function () {
        should.exist(Barista.Class);
    });

    describe('Class', function () {
        it('provides a "create" method');
        describe('"create" method', function () {
            it('creates object factories');
            it('can describe object methods');
            it('can specify an object constructor');
            it('the returned classes can be extended');
            it('sub-class methods can delegate calls to super');
        });
    });

    describe('Trait', function () {
        it('provides a set of methods that implement behavior');
        it('requires a set of methods that parametrize the provide behavior');
        describe('composition', function () {
            it('is symmetric');
            it('excludes conflicting methods');
            it('allows methods from the same trait given in different composition paths');
            it('conflicts when the same method names comes from different traits');
        });
        it('can be nested with other traits');
        it('creates sealed objects if the underlying JS engine allows it');
    });

    describe('Class and Trait composition', function () {
        describe('precedence rules', function () {
            it('gives precedence to Class methods over trait methods');
            it('gives precedence to Trait methods over super class methods');
        });
        it('can specify aliases to trait methods');
        it('can exclude trait methods');
    });
});
