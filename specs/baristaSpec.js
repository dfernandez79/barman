define(function (require) {
    'use strict';

    var Barista = require('barista'),
        _ = require('underscore');

    describe('Barista', function () {

        describe('Object definition and manipulation utilities', function () {
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

            it('provides a convenience method to do functional mixins', function () {
                var myCoffee = {};

                expect(Barista.mix(Milk, myCoffee)).toBe(myCoffee);
                expect(myCoffee.hasMilk()).toBe(true);
            });

            it('allows to use mix with just an object', function () {
                var myObj = Barista.mix({simple: true});

                expect(myObj).toEqual({simple: true});
            });

            it('provides methods to define how to create objects', function () {
                var Cup = Barista.recipe({
                        constructor: function (color) {
                            this.color = color;
                        },
                        fill: function () {
                        }
                    }),
                    myCup = new Cup('white');

                expect(Object.getPrototypeOf(myCup)).toBe(Cup.prototype);
                expect(myCup.color).toBe('white');
                expect(_(myCup.fill).isFunction()).toBe(true);
            });

            it('provides methods to define objects using functional mixins', function () {
                var Latte = Barista.recipe(Coffee, Milk, {
                        isLatte: function () {
                            return this.hasCoffee() && this.hasMilk();
                        }
                    }),
                    aLatte = new Latte();

                expect(aLatte.isLatte()).toBe(true);
            });

            it('allows to create a recipe without any additional properties', function () {
                var Latte = Barista.recipe(Coffee, Milk),
                    aLatte = new Latte();

                expect(aLatte.hasMilk()).toBe(true);
                expect(aLatte.hasCoffee()).toBe(true);
            });
        });

        describe('Underscore extensions', function () {
            it('provides an accessor to the underscore object', function () {
                expect(Barista.underscore === _).toBe(true);
            });

            it('publishes object creation and manipulation functions as underscore methods', function () {
                expect(_.mix === Barista.mix).toBe(true);
                expect(_.recipe === Barista.recipe).toBe(true);
            });
        });

        describe('Event handling', function () {
            it('provides a mechanism to make an object observable', function () {
                var myObservable = Barista.mix(Barista.Mixins.Observable);

                expect(_.isFunction(myObservable.on)).toBe(true);
                expect(_.isFunction(myObservable.off)).toBe(true);
                expect(_.isFunction(myObservable.trigger)).toBe(true);
            });

            it('can listen and trigger an event', function () {
                var myObservable = Barista.mix(Barista.Mixins.Observable), changeTriggered = false;

                myObservable.on('change', function () {
                    changeTriggered = true;
                });
                myObservable.trigger('change');

                expect(changeTriggered).toBe(true);
            });

            it('can listen to all events', function () {
                var myObservable = Barista.mix(Barista.Mixins.Observable), changeTriggered = false;

                myObservable.on('all', function () {
                    changeTriggered = true;
                });
                myObservable.trigger('change');

                expect(changeTriggered).toBe(true);
            });
        });
    });
});