var expect = require('chai').expect,
    barista = require('../src/barista');

describe('Barista', function () {
    'use strict';

    var Nil = barista.Nil,
        Class = barista.Class,
        defaultClassFactory = barista.defaultClassFactory,
        classFactoryMixin = barista.classFactoryMixin,
        aliasOfSuper = barista.aliasOfSuper,
        aliasOfMixin = barista.aliasOfMixin;

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

            it('accepts the specification of "static" methods as an argument', function () {
                var MyClass = Class.create({}, {method: function () {
                    return 'hello';
                }});

                expect(MyClass.method).to.exist;
                expect(MyClass.method()).to.equal('hello');
            });

            it('accepts a "ClassFactory" as an argument', function () {
                var testFactory = classFactoryMixin({
                        createClass: function (Parent, instanceMethods, staticMethods) {
                            return {parent: Parent, instanceMethods: instanceMethods, staticMethods: staticMethods};
                        }
                    }),
                    createdClass = Class.create(testFactory, {hello: 'world'}, {foo: 'bar'});

                expect(createdClass.staticMethods).to.deep.equal({foo: 'bar'});
                expect(createdClass.instanceMethods).to.deep.equal({hello: 'world'});
                expect(createdClass.parent).to.be.a('function');
            });

            it('accepts a "ClassFactory" in the extend method', function () {
                var Base = Class.create({
                        foo: 'bar'
                    }),
                    myFactory = classFactoryMixin({
                        createClass: function (Parent, instanceMethods, staticMethods) {
                            var newClass = defaultClassFactory.createClass(Parent, instanceMethods, staticMethods);
                            newClass.addedByFactory = true;
                            return newClass;
                        }
                    }),
                    SubClass = Base.extend(myFactory, {});

                expect(SubClass.addedByFactory).to.be.true;
            });

            it('adds the _super method even if the parent does not have it', function () {
                var Parent = function () {};

                Parent.extend = Nil.extend;

                var SubClass = Parent.extend(),
                    anInstance = new SubClass();

                expect(anInstance._super()).to.equal(Parent.prototype);
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

        describe('aliasOfSuper', function () {
            it('can be used to define a method that calls to super', function () {
                var Base = Class.create({
                        message: function () {
                            return 'base';
                        }
                    }),
                    Sub = Base.extend({
                        other: aliasOfSuper('message'),
                        message: function () {
                            return 'sub and ' + this.other();
                        }
                    }),
                    anInstance = new Sub();

                expect(anInstance.message()).to.equal('sub and base');
            });

            it('throws an exception if the super method is not defined', function () {
                var Base = Class.create({
                    bla: function () {
                        return 'base';
                    }
                });

                expect(function () {
                    Base.extend({
                        other: aliasOfSuper('message'),
                        message: function () {
                            return 'sub and ' + this.other();
                        }
                    });
                }).to.throw(ReferenceError);
            });
        });
    });

    describe('Nil', function () {
        it('is the parent of a class created with Class.create', function () {
            var MyClass = Class.create();
            expect(MyClass.__super__).to.equal(Nil.prototype);
        });

        it('has a __super__ property that returns itself', function () {
            expect(Nil.__super__).to.equal(Nil.prototype);
        });

        it('provides a _super function', function () {
            var SubNil = function () {};

            SubNil.prototype = new Nil();
            var anInstance = new SubNil();

            expect(anInstance._super()).to.equal(Nil.prototype);
        });
    });

    describe('MixinClassFactory', function () {
        var withMixins = barista.withMixins;

        it('can be called with a function to do the mixin', function () {
            var useTemplate = function (proto) {
                    proto.render = function () {
                        return 'from template';
                    };
                },
                View = Class.create(withMixins(useTemplate)),
                aView = new View();

            expect(aView.render()).to.equal('from template');
        });

        it('can be called with an object to mixin', function () {
            var useTemplate = {
                    render: function () {
                        return 'from template';
                    }
                },
                View = Class.create(withMixins(useTemplate)),
                aView = new View();

            expect(aView.render()).to.equal('from template');
        });

        it('gives precedence to class methods over mixin methods', function () {
            var useTemplate = {
                    added: 'by mixin',
                    render: function () {
                        return 'from template';
                    }
                },
                View = Class.create(withMixins(useTemplate), {render: function () {
                    return 'from subclass';
                }}),
                aView = new View();

            expect(aView.render()).to.equal('from subclass');
            expect(aView.added).to.equal('by mixin');
        });

        it('gives precedence to mixin methods over super class methods', function () {
            var BaseView = Class.create({
                    render: 'base',
                    added: 'by base view'
                }),
                useTemplate = {
                    render: 'template'
                },
                View = BaseView.extend(withMixins(useTemplate)),
                aView = new View();

            expect(aView.render).to.equal('template');
            expect(aView.added).to.equal('by base view');
        });

        it('applies multiple mixin objects from left to right', function () {
            var one = {num: 'one'}, two = {num: 'two'}, three = {num: 'three'},
                View = Class.create(withMixins(one, two, three)),
                aView = new View();

            expect(aView.num).to.equal('three');
        });

        it('applies multiple mixin functions from left to right', function () {
            var one = function (obj) {
                    obj.num = 'one';
                },
                two = function (obj) {
                    obj.num = 'two';
                },
                three = function (obj) {
                    obj.num = 'three';
                },
                View = Class.create(withMixins(one, two, three)),
                aView = new View();

            expect(aView.num).to.equal('three');
        });

        it('only accepts functions or objects as an argument', function () {
            expect(function () {
                withMixins(1);
            }).to.throw(TypeError);
        });

        it('preserves the prototype chain', function () {
            var BaseView = Class.create({render: 'base'}),
                useTemplate = {render: 'template'},
                View = BaseView.extend(withMixins(useTemplate));

            expect(Object.getPrototypeOf(View.prototype)).to.equal(BaseView.prototype);
        });

        describe('aliasOfMixin', function () {
            it('can be used to reference a method created from object mixins', function () {
                var renderMixin = {render: function () { return 'mixin'; }},
                    View = Class.create(withMixins(renderMixin), {
                        mrender: aliasOfMixin('render'),
                        render: function () { return 'me and ' + this.mrender(); }
                    }),
                    aView = new View();

                expect(aView.render()).to.equal('me and mixin');
            });

            it('can be used with aliasOfSuper', function () {
                var BaseView = Class.create({render: function () { return 'base'; }}),
                    renderMixin = {render: function () { return 'mixin'; }},
                    View = BaseView.extend(withMixins(renderMixin), {
                        baseRender: aliasOfSuper('render'),
                        mixinRender: aliasOfMixin('render'),
                        render: function () {
                            return ['me', this.baseRender(), this.mixinRender()].join(' ');
                        }
                    }),
                    aView = new View();

                expect(aView.render()).to.equal('me base mixin');
            });

            it('uses the method resulted from the application of all mixins', function () {
                var one = {num: function () {return 1;}}, two = {num: function () {return 2;}},
                    Count = Class.create(withMixins(one, two), {
                        mnum: aliasOfMixin('num'),
                        num: function () {
                            return 'is ' + this.mnum();
                        }
                    }),
                    aCount = new Count();

                expect(aCount.num()).to.equal('is 2');
            });
        });
    });
    // TODO throw error if aliasOfMixin is used without mixins
    // TODO test for callSuperConstructorMixin
    describe('Traits', function () {
        var withTraits = barista.withTraits;

        it('can be used to add methods', function () {
            var viewTrait = {render: function () { return 'hello'; }},
                MyView = Class.create(withTraits(viewTrait)),
                aView = new MyView();

            expect(aView.render()).to.equal('hello');
        });

        it('gives precedence to class methods over trait methods', function () {
            var viewTrait = {render: function () { return 'hello'; }},
                MyView = Class.create(withTraits(viewTrait), {render: function () { return 'override'; }}),
                aView = new MyView();

            expect(aView.render()).to.equal('override');
        });

        it('gives precedence to trait methods over super class methods', function () {
            var viewTrait = {render: function () { return 'hello'; }},
                Base = Class.create({render: function () { return 'base'; }}),
                MyView = Base.extend(withTraits(viewTrait)),
                aView = new MyView();

            expect(aView.render()).to.equal('hello');
        });

        it('marks conflicting trait methods', function () {
            var templateTrait = {render: function () { return 'template'; }},
                compositeTrait = {render: function () { return 'composite';}},
                MyView = Base.extend(withTraits(templateTrait, compositeTrait)),
                aView = new MyView();

            expect(function () {
                aView.render();
            }).to.throw('The "render" method is defined by multiple traits, you need to specify an implementation');
        });

        it('allows a trait to include another trait', function () {
            var helloTrait = {hello: function () { return 'hello world'; }},
                otherTrait = {other: 'hi'},
                viewTrait = {__includes__: [helloTrait, otherTrait], render: function () {return 'view';}},
                MyView = Class.create(withTraits(viewTrait)),
                aView = new MyView();

            expect(aView.hello()).to.equal('hello world');
            expect(aView.other).to.equal('hi');
            expect(aView.render()).to.equal('view');
        });

        it('allows methods from the same trait given in different composition paths', function () {
            var helloTrait = {hello: function () { return 'hello world'; }},
                otherTrait = {__includes__: [helloTrait], other: 'hi'},
                viewTrait = {__includes__: [helloTrait, otherTrait], render: function () {return 'view';}},
                MyView = Class.create(withTraits(viewTrait)),
                aView = new MyView();

            expect(aView.hello()).to.equal('hello world');
            expect(aView.other).to.equal('hi');
            expect(aView.render()).to.equal('view');
        });

        it('allows to use a single trait object in the __includes__ special property', function () {
            var messageTrait = {message: 'it worked'},
                valueTrait = {__includes__: messageTrait, value: 1},
                MyValue = Class.create(withTraits(valueTrait)),
                aValue = new MyValue();

            expect(aValue.message).to.equal('it worked');
        });

        it('can specify aliases to trait methods', function () {
            var templateTrait = {render: function () { return 'template'; }},
                compositeTrait = {render: function () { return 'composite'; }},
                MyView = Class.create(withTraits(templateTrait, compositeTrait), {
                    render: templateTrait.render
                }),
                aView = new MyView();

            expect(aView.render()).to.equal('template');
        });
    });
});
