'use strict';

describe('classes', function () {

    var barman = require('../lib'),
        expect = require('expect.js'),

        createClass = barman.createClass,
        Nil = barman.Nil;


    describe('createClass', function () {

        it('returns a constructor function', function () {
            var NewClass = createClass();

            expect(NewClass).to.be.a('function');
            expect(NewClass.prototype.constructor).to.equal(NewClass);
        });


        it('can describe object properties', function () {
            var Point = createClass({ x: 10 }),
                aPoint = new Point();

            expect(aPoint.x).to.equal(10);
        });


        it('can specify an object constructor', function () {
            var Point = createClass({
                    constructor: function ( x ) {
                        this.x = x;
                    }
                }),
                aPoint = new Point(12);

            expect(aPoint.x).to.equal(12);
        });


        it('returns classes that can be extended', function () {
            var Widget = createClass({ render: 'Widget.render' }),
                MyWidget = Widget.extend(),
                aWidget = new MyWidget();

            expect(aWidget.render).to.equal('Widget.render');
        });


        it('uses Nil as the parent class', function () {
            expect(createClass().__super__).to.equal(Nil.prototype);
        });


        it('accepts the specification of "static" properties as an argument', function () {
            var MyClass = createClass({}, {staticProp: 'hello'});

            expect(MyClass.staticProp).to.equal('hello');
        });


        it('accepts a "class factory" as an argument', function () {

            function testFactory() {
                return 'From ClassFactory'; 
            }

            var createdClass = createClass(testFactory, {hello: 'world'});

            expect(createdClass).to.equal('From ClassFactory');
        });


        it('gives the proper arguments to the "class factory"', function () {

            function testFactory( Parent, instanceMethods, staticMethods ) {
                return {parent: Parent, instanceMethods: instanceMethods, staticMethods: staticMethods};
            }

            var createdClass = createClass(testFactory, {hello: 'world'}, {foo: 'bar'});

            expect(createdClass.staticMethods).to.eql({foo: 'bar'});
            expect(createdClass.instanceMethods).to.eql({hello: 'world'});
            expect(createdClass.parent).to.equal(Nil);
        });


        it('throws an exception if the constructor is not a function', function () {
            expect(function () {
                createClass({constructor: 'hello'});
            }).to.throwError();
        });


        it('can pass arbitrary arguments to the class factory', function () {

            function testFactory() {
                return arguments;
            }
            
            var result = createClass(testFactory, 'hello', 'world', 'from', 'class factory');


            expect(result[0]).to.equal(Nil);
            expect(result[1]).to.equal('hello');
            expect(result[2]).to.equal('world');
            expect(result[3]).to.equal('from');
            expect(result[4]).to.equal('class factory');
        });


        it('supports the inclusion of traits by passing an array', function () {
            var SomeClass = createClass([
                    {secure: true},
                    {someProp: 'test'}
                ], {
                    value: 'hello'
                }),
                anInstance = new SomeClass();

            expect(anInstance.secure).to.equal(true);
            expect(anInstance.someProp).to.equal('test');
            expect(anInstance.value).to.equal('hello');
        });

    });


    describe('super delegation', function () {

        var trace = [],
            Parent = createClass({
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
});
