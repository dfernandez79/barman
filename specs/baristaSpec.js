var should = require('chai').should(),
    Barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    it('provides a Class object', function () {
        should.exist(Barista.Class);
    });
});
