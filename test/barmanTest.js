'use strict';

var barman = require('../lib/index'),
    expect = require('chai').expect;

describe('Barman', function () {

    var clone = barman.clone,
        extend = barman.extend,
        merge = barman.merge,
        conflict = barman.conflict,
        required = barman.required,
        Nil = barman.Nil,
        Class = barman.Class,
        AbstractClassFactory = barman.AbstractClassFactory,
        isClassFactory = barman.isClassFactory,
        include = barman.include,

        ifGetPrototypeOfIsSupportedIt = Object.getPrototypeOf ? it : it.skip,
        ifNonEnumerablePropertiesAreSupportedIt = Object.getOwnPropertyNames ? it : it.skip;


    describe('extend', function () {

        it('copies not owned properties', function () {
            var proto = {value: 'hello'}, obj = clone(proto), extended = extend({}, obj);

            expect(obj.hasOwnProperty('value')).to.equal(false);
            expect(extended.hasOwnProperty('value')).to.equal(true);
            expect(extended.value).to.equal('hello');
        });

    });

    describe('merge', function () {

        it('merges given properties into a new object', function () {
            var one = { one: 'prop from one' },
                two = { two: 'prop from two' },
                result = merge(one, two);

            expect(result).to.not.equal(one);
            expect(result).to.not.equal(two);
            expect(result.one).to.equal(one.one);
            expect(result.two).to.equal(two.two);
        });


        it('marks conflicting properties', function () {
            var result = merge({ prop: 'prop from one' }, { prop: 'prop from two' });

            expect(result.prop).to.equal(conflict);
        });


        it('accepts properties that has the same value', function () {
            var prop = 'value',
                result = merge({ prop: prop }, { prop: prop });

            expect(result.prop).to.equal(prop);
        });


        it('accepts implementations for properties marked as required', function () {
            var result = merge({ prop: required }, { prop: 'value' });

            expect(result.prop).to.equal('value');
        });


        it('does not generate conflicts with Object built-in methods', function () {
            var result = merge({ toString: function () { return 'hello'; } }, { other: true });

            expect(result.toString()).to.equal('hello');
        });


        it('generates conflicts if an Object built-in has been already defined', function () {
            var result = merge(
                { toString: function () { return 'hello'; } },
                { toString: function () { return 'hello'; } }
            );

            expect(result.toString).to.throw(Error);
        });


        it('accepts a redefinition of constructor', function () {
            var Some = merge(
                { constructor: function () { this.x = 10; } },
                { toString: function () { return 'hello'; } }
            );

            var result = new Some.constructor();

            expect(result.x).to.equal(10);
            expect(Some.toString()).to.equal('hello');
        });


        it('merges non-owned properties', function () {
            var proto = {value: 'hello'}, other = clone(proto), merged = merge({one: 1}, other);

            expect(other.hasOwnProperty('value')).to.equal(false);
            expect(merged.hasOwnProperty('one')).to.equal(true);
            expect(merged.hasOwnProperty('value')).to.equal(true);
            expect(merged.value).to.equal('hello');
        });


        it('flattens methods from prototype', function () {
            var proto = {value: 'hello'},
                one = extend(clone(proto), {one: 1}),
                two = extend(clone(proto), {two: 2}),
                merged = merge(one, two);

            expect(merged.hasOwnProperty('value'));
            expect(merged.value).to.equal('hello');
        });

    });

    describe('conflict', function () {

        it('throws an error when executed', function () {
            expect(conflict).to.throw(Error);
        });

    });

    describe('required', function () {

        it('throws an error when executed', function () {
            expect(required).to.throw(Error);
        });

    });

    describe('Nil', function () {

        it('has a __super__ property that returns itself', function () {
            expect(Nil.__super__).to.equal(Nil.prototype);
        });

        ifNonEnumerablePropertiesAreSupportedIt('has a non-enumerable __super__ property', function () {
            expect(Object.getOwnPropertyDescriptor(Nil, '__super__').enumerable).to.equal(false);
        });

    });

    describe('Class', function () {

        describe('create', function () {

            it('returns a constructor function', function () {
                expect(Class.create()).to.be.a('function');
            });


            it('returns a function with prototype.constructor referencing to itself', function () {
                var NewClass = Class.create();

                expect(NewClass.prototype.constructor).to.equal(NewClass);
            });


            it('can describe object properties', function () {
                var Point = Class.create({ x: 10 }),
                    aPoint = new Point();

                expect(aPoint.x).to.equal(10);
            });


            it('can specify an object constructor', function () {
                var Point = Class.create({
                        constructor: function ( x ) {
                            this.x = x;
                        }
                    }),
                    aPoint = new Point(12);

                expect(aPoint.x).to.equal(12);
            });


            it('returns classes that can be extended', function () {
                var Widget = Class.create({ render: 'Widget.render' }),
                    MyWidget = Widget.extend(),
                    aWidget = new MyWidget();

                expect(aWidget.render).to.equal('Widget.render');
            });


            it('uses Nil as the parent class', function () {
                expect(Class.create().__super__).to.equal(Nil.prototype);
            });


            it('accepts the specification of "static" properties as an argument', function () {
                var MyClass = Class.create({}, {staticProp: 'hello'});

                expect(MyClass.staticProp).to.equal('hello');
            });


            it('accepts a "class factory" as an argument', function () {
                var TestFactory = AbstractClassFactory.extend({
                        createClass: function () { return 'From ClassFactory'; }
                    }),

                    createdClass = Class.create(new TestFactory(), {hello: 'world'});

                expect(createdClass).to.equal('From ClassFactory');
            });


            it('gives the proper arguments to the "class factory"', function () {
                var TestFactory = AbstractClassFactory.extend({

                        createClass: function ( Parent, instanceMethods, staticMethods ) {
                            return {parent: Parent, instanceMethods: instanceMethods, staticMethods: staticMethods};
                        }

                    }),

                    createdClass = Class.create(new TestFactory(), {hello: 'world'}, {foo: 'bar'});

                expect(createdClass.staticMethods).to.eql({foo: 'bar'});
                expect(createdClass.instanceMethods).to.eql({hello: 'world'});
                expect(createdClass.parent).to.equal(Nil);
            });


            it('throws an exception if the constructor is not a function', function () {
                expect(function () {
                    Class.create({constructor: 'hello'});
                }).to.throw(TypeError);
            });


            it('can pass arbitrary arguments to the class factory', function () {
                var TestClassFactory = AbstractClassFactory.extend({
                        createClass: function () {
                            return arguments;
                        }
                    }),

                    testClass = Class.create(new TestClassFactory(), 'hello', 'world', 'from', 'class factory');


                expect(testClass[0]).to.equal(Nil);
                expect(testClass[1]).to.equal('hello');
                expect(testClass[2]).to.equal('world');
                expect(testClass[3]).to.equal('from');
                expect(testClass[4]).to.equal('class factory');
            });

        });


        describe('extend', function () {

            it('overrides super class properties with subclass properties', function () {
                var Widget = Class.create({ render: 'Super RENDER'  }),
                    CustomWidget = Widget.extend({ render: 'Custom RENDER'}),

                    aWidget = new CustomWidget();

                expect(aWidget.render).to.equal('Custom RENDER');
            });


            ifGetPrototypeOfIsSupportedIt('supports getPrototypeOf to do super delegation', function () {
                var Widget = Class.create({ render: 'SUPER' }),

                    CustomWidget = Widget.extend({
                        render: function () {
                            var parent = Object.getPrototypeOf(Object.getPrototypeOf(this));
                            return 'Custom ' + parent.render;
                        }
                    });

                expect((new CustomWidget()).render()).to.equal('Custom SUPER');
            });


            it('adds the __super__ property even if the parent is not defined with barman', function () {
                var Parent = function () {};

                Parent.extend = Nil.extend;

                expect(Parent.extend().__super__).to.equal(Parent.prototype);
            });


            ifNonEnumerablePropertiesAreSupportedIt('adds a non-enumerable __super__ property', function () {
                var Parent = Class.create({}),
                    MyClass = Parent.extend({});

                expect(Object.getOwnPropertyDescriptor(MyClass, '__super__').enumerable).to.equal(false);
            });


            it('calls to the super constructor if the sub-class do not defines a constructor', function () {
                var Point = Class.create({
                        constructor: function ( x, y ) {
                            this.x = x;
                            this.y = y;
                        }
                    }),

                    ColoredPoint = Point.extend({
                        color: 'blue',
                        show: function () {
                            return 'blue ' + this.x + ', ' + this.y;
                        }
                    }),

                    aPoint = new ColoredPoint(5, 6);

                expect(aPoint.show()).to.equal('blue 5, 6');
            });


            it('uses the constructor given by the sub-class', function () {
                var Parent = Class.create({constructor: function () { this.x = 10; }}),
                    Sub = Parent.extend({constructor: function () { this.x = 42; }}),
                    anInstance = new Sub();

                expect(anInstance.x).to.equal(42);
            });


            it('allows calls to super constructor on explicit constructor implementations', function () {
                var Parent1 = Class.create({
                        constructor: function () {
                            this.parent1ConstructorCalled = true;
                        }
                    }),
                    Parent2 = Parent1.extend({
                        constructor: function () {
                            Parent2.__super__.constructor.call(this);
                            this.parent2ConstructorCalled = true;
                        }
                    }),

                    Concrete = Parent2.extend({}),
                    anInstance = new Concrete();

                expect(anInstance.parent1ConstructorCalled).to.equal(true);
                expect(anInstance.parent2ConstructorCalled).to.equal(true);
            });

        });
    });

    describe('super class delegation', function () {

        var trace = [],
            Parent = Class.create({
                value: 10,
                method: function () { trace.push('Parent.method'); },
            });

        afterEach(function () {
            trace.splice(0, trace.length);
        });


        it('can be done using __super__', function () {
            var Child = Parent.extend({
                    method: function () {
                        Child.__super__.method.call(this);
                        trace.push('method');
                    }
                }),
                aChild = new Child();

            aChild.method();
            expect(trace).to.eql(['Parent.method', 'method']);
        });


        it('goes up to the parent hierarchy', function () {
            var Parent2 = Parent.extend({}),
                Child = Parent2.extend({
                    method: function () {
                        Child.__super__.method.call(this);
                        trace.push('method');
                    }
                }),
                aChild = new Child();

            aChild.method();
            expect(trace).to.eql(['Parent.method', 'method']);
        });

    });

    describe('include', function () {

        it('returns an instance of a class factory', function () {
            expect(isClassFactory(include())).to.equal(true);
        });


        it('gives precedence to class properties over trait properties', function () {
            var templateRendering = {
                    other: 'hello',
                    render: 'from trait'
                },

                View = Class.create(
                    include(templateRendering), {
                        render: 'from subclass'
                    }),

                aView = new View();

            expect(aView.render).to.equal('from subclass');
            expect(aView.other).to.equal('hello');
        });


        it('gives precedence to trait properties over super class properties', function () {
            var BaseView = Class.create({
                    render: 'base'
                }),

                testTrait = {
                    render: 'trait'
                },

                View = BaseView.extend(include(testTrait)),

                aView = new View();

            expect(aView.render).to.equal('trait');
        });


        ifGetPrototypeOfIsSupportedIt('preserves the prototype chain', function () {
            var BaseView = Class.create({
                    render: 'base'
                }),

                testTrait = {
                    render: 'trait'
                },

                View = BaseView.extend(include(testTrait));

            expect(Object.getPrototypeOf(View.prototype)).to.equal(BaseView.prototype);
        });


        it('allows a trait to include another trait', function () {
            var helloTrait = {
                    hello: function () { return 'hello world'; }
                },

                otherTrait = {
                    other: 'hi'
                },

                viewTrait = extend(
                    merge(helloTrait, otherTrait), {
                        render: function () {
                            return 'view';
                        }
                    }) ,

                MyView = Class.create(include(viewTrait)),

                aView = new MyView();

            expect(aView.hello()).to.equal('hello world');
            expect(aView.other).to.equal('hi');
            expect(aView.render()).to.equal('view');
        });


        it('can specify aliases to trait methods', function () {
            var templateTrait = {
                    render: function () {
                        return 'template';
                    }
                },
                compositeTrait = {
                    render: function () { return 'composite'; }
                },

                MyView = Class.create(
                    include(templateTrait, compositeTrait), {
                        render: templateTrait.render
                    }),

                aView = new MyView();

            expect(aView.render()).to.equal('template');
        });


        it('throws an exception if there is conflicting methods', function () {
            var templateTrait = {
                    render: function () {
                        return 'template';
                    }
                },
                compositeTrait = {
                    render: function () {
                        return 'composite';
                    }
                };

            expect(function () { Class.create(include(templateTrait, compositeTrait)); }).to.throw(Error);
        });


        it('gives a description of the conflicting methods when a conflict exception is thrown', function () {
            var templateTrait = {
                    render: function () {
                        return 'template';
                    },
                    other: function () {
                        return 'hello';
                    }
                },
                compositeTrait = {
                    render: function () {
                        return 'composite';
                    },
                    other: function () {
                        return 'world';
                    }
                };

            expect(function () {
                Class.create(include(templateTrait, compositeTrait));
            }).to.throw('There is a merge conflict for the following properties: other,render');
        });


        it('do not throws an exception when conflicts are resolved', function () {
            var templateTrait = {
                    render: function () {
                        return 'template';
                    }
                },
                compositeTrait = {
                    render: function () {
                        return 'composite';
                    }
                },

                MyView = Class.create(include(templateTrait, compositeTrait), {
                    templateRender: templateTrait.render,
                    compositeRender: compositeTrait.render,
                    render: function () {
                        return this.templateRender() + ' ' + this.compositeRender();
                    }
                }),

                aView = new MyView();

            expect(aView.render()).to.equal('template composite');
        });
    });

    describe('createClass', function () {

        it('is a shortcut for Class.create', function () {

            var SomeClass = barman.createClass({
                    constructor: function ( message ) {
                        this.message = message;
                    },
                    hello: function () {
                        return this.message;
                    }
                }),
                anInstance = new SomeClass('a message');

            expect(anInstance.hello()).to.equal('a message');
        });

    });

});