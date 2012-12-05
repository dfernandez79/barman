define(function (require) {
    'use strict';

    var Barista = require('barista'),
        _ = require('underscore');

    describe('Barista', function () {

        describe('Object definition and manipulation', function () {
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
                expect(_.before === Barista.before).toBe(true);
            });
        });

        describe('Mixins', function () {
            describe('Observable', function () {
                var myObservable,
                    nullFunction = function () {
                    };

                beforeEach(function () {
                    myObservable = Barista.mix(Barista.Mixins.Observable);
                });

                it('provides a mechanism to make an object observable', function () {
                    expect(_.isFunction(myObservable.on)).toBe(true);
                    expect(_.isFunction(myObservable.off)).toBe(true);
                    expect(_.isFunction(myObservable.trigger)).toBe(true);
                });

                it('can listen and trigger an event', function () {
                    var changeTriggered = false;

                    myObservable.on('change', function () {
                        changeTriggered = true;
                    });
                    myObservable.trigger('change');

                    expect(changeTriggered).toBe(true);
                });

                it('can listen to all events', function () {
                    var changeTriggered = false;

                    myObservable.on('all', function () {
                        changeTriggered = true;
                    });
                    myObservable.trigger('change');

                    expect(changeTriggered).toBe(true);
                });

                it('returns the receiver in the "on" method to allow chaining', function () {
                    expect(myObservable.on('change', nullFunction)).toBe(myObservable);
                });

                it('returns the receiver in the "off" method to allow chaining', function () {
                    expect(myObservable.off('change')).toBe(myObservable);
                });

                it('can remove an event handler by event name', function () {
                    var eventsCaptured = 0;

                    myObservable.on('change', function () {
                        eventsCaptured += 1;
                    });
                    myObservable.trigger('change');
                    myObservable.off('change');
                    myObservable.trigger('change');


                    expect(eventsCaptured).toBe(1);
                });

                it('can remove an event handler by event name and callback', function () {
                    var cb1EventsCaptured = 0,
                        cb2EventsCaptured = 0,
                        callback1 = function () {
                            cb1EventsCaptured += 1;
                        },
                        callback2 = function () {
                            cb2EventsCaptured += 1;
                        };

                    myObservable.on('change', callback1).on('change', callback2);

                    myObservable.trigger('change');
                    myObservable.off('change', callback2);
                    myObservable.trigger('change');

                    expect(cb1EventsCaptured).toBe(2);
                    expect(cb2EventsCaptured).toBe(1);
                });

                it('can remove an event handler by event name, callback, and context', function () {
                    var eventsCaptured = 0,
                        context = 'hello',
                        callback1 = function () {
                            eventsCaptured += 1;
                        };

                    myObservable.on('change', callback1).on('change', callback1, context);

                    myObservable.trigger('change');
                    expect(eventsCaptured).toBe(2);

                    myObservable.off('change', callback1, context).trigger('change');
                    expect(eventsCaptured).toBe(3);
                });
            });
        });
    });
});