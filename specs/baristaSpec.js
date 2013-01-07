var should = require('chai').should(),
    Barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    var Class = Barista.Class;

    describe('Class', function () {
        describe('"create" method', function () {
            var Empty = Class.create();

            it('returns a constructor function', function () {
                Empty.should.be.a('function');
                (new Empty()).should.be.a('object');
            });

            it('returns a function with prototype.constructor referencing to itself', function () {
                Empty.prototype.constructor.should.be.equal(Empty);
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

                aWidget.render().should.be.equal('Custom RENDER');
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

                (new CustomWidget()).render().should.be.equal('Custom SUPER');
            });
        });

        describe('__super__ property', function () {
            var Widget = Class.create(),
                CustomWidget = Widget.extend();

            it('points to the parent prototype', function () {
                CustomWidget.__super__.should.be.equal(Widget.prototype);
            });

            it('can be used to get the parent constructor', function () {
                CustomWidget.__super__.constructor.should.be.equal(Widget);
            });

            it('is defined in the constructor but not in the prototype', function () {
                should.exist(CustomWidget.__super__);
                should.not.exist(CustomWidget.prototype.__super__);
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
                aWidget._super().should.be.equal(CustomWidget.__super__);
            });

            it('returns a function bound to this when the method name is given', function () {
                aWidget.render().should.be.equal('Custom SUPER 123');
            });

            it('throws ReferenceError when a invalid method name is given', function () {
                (function () {
                    aWidget._super('bla');
                }).should.throw(ReferenceError);
            });

            it('throws TypeError if a name of a non-function is given', function () {
                (function () {
                    aWidget._super('value');
                }).should.throw(TypeError);
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
