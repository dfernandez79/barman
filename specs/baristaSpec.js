var barista = require('../src/barista'),
    should = require('chai').should();

describe('Barista', function () {
    'use strict';

    var Coffee = function (proto) {
            proto.hasCoffee = function () {
                return true;
            };
            return proto;
        },
        Milk = function (proto) {
            proto.hasMilk = function () {
                return  true;
            };
            return proto;
        };

    describe('mix method', function () {
        it('extends an object by evaluating a function', function () {
            var myCoffee = {};
            barista.mix(Milk, myCoffee).should.equal(myCoffee);
            myCoffee.hasMilk().should.equal(true);
        });

        it('returns the given object if no mixin function is specified', function () {
            var input = {simple: true},
                myObj = barista.mix(input);
            myObj.should.equal(input);
        });
    });

    describe('recipe method', function () {
        it('can define a constructor and prototype', function () {
            var Cup = barista.recipe({
                    constructor: function (color) {
                        this.color = color;
                    },
                    fill: function () {
                    }
                }),
                myCup = new Cup('white');

            myCup.should.be.an.instanceOf(Cup);
            myCup.color.should.equal('white');
            myCup.fill.should.be.a('function');
        });

        it('can extend the object definition using mixins', function () {
            var Latte = barista.recipe(Coffee, Milk, {
                    isLatte: function () {
                        return this.hasCoffee() && this.hasMilk();
                    }
                }),
                aLatte = new Latte();

            aLatte.isLatte().should.equal(true);
        });

        it('allows to define objects with mixins functions only', function () {
            var Latte = barista.recipe(Coffee, Milk),
                aLatte = new Latte();

            aLatte.hasMilk().should.equal(true);
            aLatte.hasCoffee().should.equal(true);
        });
    });

    describe('mixins', function () {
        var recipe = barista.recipe,
            mixins = barista.mixins;

        describe('development functions', function () {
            it('it provides a before method', function () {
                var trace = [],
                    world = function () {
                        trace.push('World');
                    },
                    hello = function () {
                        trace.push('Hello');
                    };

                mixins.dev.before(world, hello)();

                trace.join(' ').should.equal('Hello World');
            });
        });

        describe('mixins factory methods', function () {
            describe('wrapMethods', function () {
                it('uses before/after prefix by default', function () {
                    var trace = [],
                        MyObject = recipe(mixins.wrapMethods('greet'), {
                            beforeGreet: function () {
                                trace.push('Hello', 'Mr.');
                            },
                            greet: function () {
                                trace.push('Thompson');
                            },
                            afterGreet: function () {
                                trace.push('!');
                            }
                        }),
                        instance = new MyObject();

                    instance.greet();

                    trace.join(' ').should.equal('Hello Mr. Thompson !');
                });
            });
        });
    });

});
