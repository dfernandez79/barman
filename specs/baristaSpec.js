var should = require('chai').should(),
    Barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    var Class = Barista.Class;

    describe('Class', function () {
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

            it('assigns a proper constructor property', function () {
                var Empty = Class.create();

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
                            return 'Custom SUPER';
                        }
                    });

                var w = new CustomWidget();
                console.log(w);
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
    });

    describe('Method Descriptors', function () {
        describe('injectSuper', function () {
            var injectSuper = Barista.injectSuper;

            it('adds a first argument to allow super method delegation', function () {
                var Widget = Class.create({
                        render: function () {
                            return 'SUPER';
                        }
                    }),
                    CustomWidget = Widget.extend({
                        render: injectSuper(function (_super) {
                            return 'Custom ' + _super();
                        })
                    });

                (new CustomWidget()).render().should.be.equal('Custom SUPER');
            });

            it('the super function is bound to this', function () {
                var Point = Class.create({
                        toString: function () {
                            return '(' + this.x + ',' + this.y + ')';
                        }
                    }),
                    XPoint = Point.extend({
                        constructor: function (x, y) {
                            this.x = x;
                            this.y = y;
                        },
                        toString: injectSuper(function (_super) {
                            return '---' + _super() + '---';
                        })
                    }),
                    aPoint = new XPoint(7, 9);

                aPoint.toString().should.be.equal('---(7,9)---');
            });

            it('hides the super argument from the public function arguments', function () {
                var Collection = Class.create({
                        add: function (val) {
                            this.values.push(val);
                        }
                    }),
                    MyCollection = Collection.extend({
                        constructor: function () {
                            this.values = [];
                        },
                        add: injectSuper(function (_super, val) {
                            _super(val);
                        })
                    }),
                    col = new MyCollection();

                col.add(4);
                col.values.length.should.be.equal(1);
                col.values[0].should.be.equal(4);
            });

            it('can be used with constructors', function () {
                var Point = Class.create({
                        constructor: function (x, y) {
                            this.x = x;
                            this.y = y;
                        },
                        toString: function () {
                            return '(' + this.x + ',' + this.y + ')';
                        }
                    }),
                    XPoint = Point.extend({
                        constructor: injectSuper(function (_super, x, y) {
                            _super(x, y);
                        })
                    }),
                    aPoint = new XPoint(7, 9);

                aPoint.toString().should.be.equal('(7,9)');
            });

            it('delegates a super call in constructor to the parent constructor');
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
