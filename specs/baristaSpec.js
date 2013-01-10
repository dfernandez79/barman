var expect = require('chai').expect,
    Barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    var Class = Barista.Class;

    describe('Class', function () {
        describe('"create" method', function () {
            var Empty = Class.create();

            it('returns a constructor function', function () {
                expect(Empty).to.be.a('function');
                expect(new Empty()).to.be.a('object');
            });

            it('returns a function with prototype.constructor referencing to itself', function () {
                expect(Empty.prototype.constructor).to.equal(Empty);
            });

            it('can describe object methods', function () {
                var Point = Class.create({
                        move: function () {
                            return 'moved';
                        }
                    }),
                    aPoint = new Point();

                expect(aPoint.move).to.be.a('function');
                expect(aPoint.move()).to.equal('moved');
            });

            it('can specify an object constructor', function () {
                var Point = Class.create({
                        constructor: function (x, y) {
                            this.x = x;
                            this.y = y;
                        }}),
                    aPoint = new Point(10, 20);

                expect(aPoint.x).to.equal(10);
                expect(aPoint.y).to.equal(20);
            });

            it('returns classes that can be extended', function () {
                var Widget = Class.create({
                        render: function () {
                            return 'Widget.render';
                        }
                    }),
                    MyWidget = Widget.extend(),
                    aWidget = new MyWidget();

                expect(aWidget.render()).to.equal('Widget.render');
            });

            it('overrides super class methods with subclass methods', function () {
                var Widget = Class.create({
                        render: function () {
                            return 'Super RENDER';
                        }
                    }),
                    CustomWidget = Widget.extend({
                        render: function () {
                            return 'Custom RENDER';
                        }
                    }),
                    aWidget = new CustomWidget();

                expect(aWidget.render()).to.equal('Custom RENDER');
            });

            it('supports getPrototypeOf to do super delegation', function () {
                var Widget = Class.create({
                        render: function () {
                            return 'SUPER';
                        }
                    }),
                    CustomWidget = Widget.extend({
                        render: function () {
                            var parent = Object.getPrototypeOf(Object.getPrototypeOf(this));
                            return 'Custom ' + parent.render.call(this);
                        }
                    });

                expect((new CustomWidget()).render()).to.equal('Custom SUPER');
            });
        });

        describe('__super__ property', function () {
            var Widget = Class.create(),
                CustomWidget = Widget.extend();

            it('points to the parent prototype', function () {
                expect(CustomWidget.__super__).to.equal(Widget.prototype);
            });

            it('can be used to get the parent constructor', function () {
                expect(CustomWidget.__super__.constructor).to.equal(Widget);
            });

            it('is defined in the constructor but not in the prototype', function () {
                expect(CustomWidget.__super__).to.a('object');
                expect(CustomWidget.prototype.__super__).to.be.undefined;
            });
        });

        describe('_super method', function () {
            var Widget = Class.create({
                    value: 'testValue',
                    render: function () {
                        return 'SUPER ' + this.x;
                    }
                }),
                CustomWidget = Widget.extend({
                    constructor: function (x) {
                        this.x = x;
                    },
                    render: function () {
                        var superRender = this._super('render');
                        return 'Custom ' + superRender();
                    }
                }),
                aWidget = new CustomWidget(123);

            it('returns __super__ when no argument is given', function () {
                expect(aWidget._super()).to.equal(CustomWidget.__super__);
            });

            it('returns a function bound to this when the method name is given', function () {
                expect(aWidget.render()).to.equal('Custom SUPER 123');
            });

            it('throws ReferenceError when a invalid method name is given', function () {
                expect(function () {
                    aWidget._super('bla');
                }).to.throw(ReferenceError);
            });

            it('throws TypeError if a name of a non-function is given', function () {
                expect(function () {
                    aWidget._super('value');
                }).to.throw(TypeError);
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
