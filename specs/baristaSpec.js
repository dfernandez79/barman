define(function (require) {
    'use strict';

    var barista = require('barista'),
        _ = require('underscore');

    describe('Barista', function () {
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
                expect(barista.mix(Milk, myCoffee)).toBe(myCoffee);
                expect(myCoffee.hasMilk()).toBe(true);
            });

            it('returns the given object if no mixin function is specified', function () {
                var input = {simple: true},
                    myObj = barista.mix(input);
                expect(myObj).toEqual(input);
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

                expect(Object.getPrototypeOf(myCup)).toBe(Cup.prototype);
                expect(myCup.color).toBe('white');
                expect(_.isFunction(myCup.fill)).toBe(true);
            });

            it('can extend the object definition using mixins', function () {
                var Latte = barista.recipe(Coffee, Milk, {
                        isLatte: function () {
                            return this.hasCoffee() && this.hasMilk();
                        }
                    }),
                    aLatte = new Latte();

                expect(aLatte.isLatte()).toBe(true);
            });

            it('allows to define objects with mixins functions only', function () {
                var Latte = barista.recipe(Coffee, Milk),
                    aLatte = new Latte();

                expect(aLatte.hasMilk()).toBe(true);
                expect(aLatte.hasCoffee()).toBe(true);
            });
        });
    });
});