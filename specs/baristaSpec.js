var should = require('chai').should(),
    Barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    it('provides a Class object', function () {
        should.exist(Barista.Class);
    });

    describe('Class', function () {
        var Class = Barista.Class;

        it('provides a "create" method', function () {
            should.exist(Class.create);
            Class.create.should.be.a('function');
        });

        describe('"create" method', function () {
            it('creates object factories', function () {
                var Empty = Class.create();

                Empty.should.be.a('function');
                (new Empty()).should.be.a('object');
            });

            it('can describe object methods', function () {
                var Point = Class.create({
                        move: function () {
                            return 'moved';
                        }
                    }),
                    aPoint = new Point();

                should.exist(aPoint.move);
                aPoint.move.should.be.a('function');
                aPoint.move().should.be.equal('moved');
            });

            it('can specify an object constructor', function () {
                var Point = Class.create({
                        constructor: function (x, y) {
                            this.x = x;
                            this.y = y;
                        }}),
                    aPoint = new Point(10, 20);

                should.exist(aPoint.x);
                should.exist(aPoint.y);
                aPoint.x.should.be.equal(10);
                aPoint.y.should.be.equal(20);
            });

            it('returns classes that can be extended', function () {
                var Widget = Class.create({
                        render: function () {
                            return 'Widget.render';
                        }
                    }),
                    MyWidget = Widget.extend(),
                    aWidget = new MyWidget();

                should.exist(aWidget.render);
                aWidget.render().should.be.equal('Widget.render');
            });

            it('provides a __super__ property to allow parent class delegation', function () {
                var Widget = Class.create({
                        render: function () {
                            return 'Parent render';
                        }
                    }),
                    MyWidget = Widget.extend({
                        render: function () {
                            return 'Child render / ' + this.__super__.render.apply(this);
                        }
                    }),
                    aWidget = new MyWidget();

                should.exist(aWidget.render);
                aWidget.render().should.be.equal('Child render / Parent render');
            });
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
