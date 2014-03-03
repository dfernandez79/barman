'use strict';

var
  expect = require( 'expect.js' ),
  barman = require('../lib'),

  mix = barman.mix,
  newclass = barman.newclass,
  Nil = barman.Nil,

  ifGetPrototypeOfIsSupportedIt = Object.getPrototypeOf ? it : it.skip,
  ifNonEnumerablePropertiesAreSupportedIt = Object.getOwnPropertyNames ? it : it.skip;


describe('newclass', function() {

  it('returns a constructor function', function() {
    expect( newclass() ).to.be.a( 'function' );
  });


  it('returns a function with prototype.constructor referencing to itself', function() {
    var NewClass = newclass();

    expect( NewClass.prototype.constructor ).to.equal( NewClass );
  });


  it('can describe object properties', function() {
    var
      Point = newclass({x: 10}),
      aPoint = new Point();

    expect( aPoint.x ).to.equal( 10 );
  });


  it('can specify an object constructor', function() {
    var
      Point = newclass({
        constructor: function( x ) {
          this.x = x;
        }
      }),
      aPoint = new Point( 12 );

    expect( aPoint.x ).to.equal( 12 );
  });


  it('returns classes that can be extended', function() {
    var
      Widget = newclass({render: 'Widget.render'}),
      MyWidget = Widget.extend(),
      aWidget = new MyWidget();

    expect( aWidget.render ).to.equal( 'Widget.render' );
  });


  it('uses Nil as the parent class', function () {
    expect(newclass().__super__).to.equal(Nil.prototype);
  });


  it('accepts the specification of "static" properties as an argument', function() {
    var
      MyClass = newclass({}, {staticProp: 'hello'});

    expect( MyClass.staticProp ).to.equal( 'hello' );
  });


  it('throws an exception if the constructor is not a function', function() {
    expect(function() {
      newclass({constructor: 'hello'});
    }).to.throwError();
  });


  ifGetPrototypeOfIsSupportedIt('supports getPrototypeOf to do super delegation', function() {
    var
      Widget = newclass({render: 'SUPER'}),

      CustomWidget = Widget.extend({
        render: function() {
          var parent = Object.getPrototypeOf( Object.getPrototypeOf( this ) );
          return 'Custom ' + parent.render;
        }
      });

    expect( ( new CustomWidget() ).render() ).to.equal( 'Custom SUPER' );
  });


  it('adds the __super__ property even if the parent is not defined with barman', function() {
    var Parent = function() {};

    expect( newclass( Parent ).__super__ ).to.equal( Parent.prototype );
  });


  ifNonEnumerablePropertiesAreSupportedIt('adds a non-enumerable __super__ property', function() {
    var
      Parent = newclass(),
      MyClass = newclass( Parent );

    expect( Object.getOwnPropertyDescriptor( MyClass, '__super__' ).enumerable ).to.equal( false );
  });


  it('calls to the super constructor if the sub-class do not defines a constructor', function() {
    var
      Point = newclass({
        constructor: function( x, y ) {
          this.x = x;
          this.y = y;
        }
      }),

      ColoredPoint = Point.extend({
        color: 'blue',
        show: function() {
          return 'blue ' + this.x + ', ' + this.y;
        }
      }),

      aPoint = new ColoredPoint( 5, 6 );

    expect( aPoint.show() ).to.equal( 'blue 5, 6' );
  });


  it('uses the constructor given by the sub-class', function() {
    var
      Parent = newclass({
        constructor: function() {
          this.x = 10;
        }
      }),
      Sub = Parent.extend({
        constructor: function() {
          this.x = 42;
        }
      }),
      anInstance = new Sub();

    expect( anInstance.x ).to.equal( 42 );
  });


  it('allows calls to super constructor on explicit constructor implementations', function() {
    var
      Parent1 = newclass({
        constructor: function() {
          this.parent1ConstructorCalled = true;
        }
      }),
      Parent2 = Parent1.extend({
        constructor: function() {
          Parent2.__super__.constructor.call( this );
          this.parent2ConstructorCalled = true;
        }
      }),

      Concrete = Parent2.extend(),
      anInstance = new Concrete();

    expect( anInstance.parent1ConstructorCalled ).to.equal( true );
    expect( anInstance.parent2ConstructorCalled ).to.equal( true );
  });


  describe('super class delegation', function() {

    var
      trace = [],
      Parent = newclass({
        value: 10,
        method: function() {
          trace.push( 'Parent.method' );
        },
      });


    afterEach( function() {
      trace.splice( 0, trace.length );
    });


    it('can be done using __super__', function() {
      var
        Child = Parent.extend({
          method: function() {
            Child.__super__.method.call( this );
            trace.push( 'method' );
          }
        }),
        aChild = new Child();

      aChild.method();
      expect( trace ).to.eql( [ 'Parent.method', 'method' ] );
    });


    it('goes up to the parent hierarchy', function() {
      var
        Parent2 = Parent.extend(),
        Child = Parent2.extend({
          method: function() {
            Child.__super__.method.call( this );
            trace.push( 'method' );
          }
        }),
        aChild = new Child();

      aChild.method();
      expect( trace ).to.eql( [ 'Parent.method', 'method' ] );
    });

  });


  describe('traits composition', function() {

    it('gives precedence to class properties over trait properties', function() {
      var
        templateRendering = {
          other: 'hello',
          render: 'from trait'
        },

        View = newclass([ templateRendering ], {
            render: 'from subclass'
          }),

        aView = new View();

      expect( aView.render ).to.equal( 'from subclass' );
      expect( aView.other ).to.equal( 'hello' );
    });


    it('gives precedence to trait properties over super class properties', function() {
      var
        BaseView = newclass({
          render: 'base'
        }),

        testTrait = {
          render: 'trait'
        },

        View = BaseView.extend( [ testTrait ] ),

        aView = new View();

      expect( aView.render ).to.equal( 'trait' );
    } );


    ifGetPrototypeOfIsSupportedIt( 'preserves the prototype chain', function() {
      var
        BaseView = newclass( {
          render: 'base'
        }),

        testTrait = {
          render: 'trait'
        },

        View = BaseView.extend( [ testTrait ] );

      expect( Object.getPrototypeOf( View.prototype ) ).to.equal( BaseView.prototype );
    });


    it( 'allows a trait to include another trait', function() {
      var
        helloTrait = {
          hello: function() {
            return 'hello world';
          }
        },

        otherTrait = {
          other: 'hi'
        },

        viewTrait = mix([ helloTrait, otherTrait ], {
            render: function() {
              return 'view';
            }
          }),

        MyView = newclass( [ viewTrait ] ),

        aView = new MyView();

      expect( aView.hello() ).to.equal( 'hello world' );
      expect( aView.other ).to.equal( 'hi' );
      expect( aView.render() ).to.equal( 'view' );
    });


    it( 'can specify aliases to trait methods', function() {
      var
        templateTrait = {
          render: function() {
            return 'template';
          }
        },
        compositeTrait = {
          render: function() {
            return 'composite';
          }
        },

        MyView = newclass([ templateTrait, compositeTrait ], {
            render: templateTrait.render
          }),

        aView = new MyView();

      expect( aView.render() ).to.equal( 'template' );
    });


    it('throws an exception if there is conflicting methods', function() {
      var
        templateTrait = {
          render: function() {
            return 'template';
          }
        },
        compositeTrait = {
          render: function() {
            return 'composite';
          }
        };

      expect( function() {
        newclass( [ templateTrait, compositeTrait ] );
      }).to.throwError();
    });


    it('gives a description of the conflicting methods when a conflict exception is thrown', function() {
      var
        templateTrait = {
          render: function() {
            return 'template';
          },
          other: function() {
            return 'hello';
          }
        },
        compositeTrait = {
          render: function() {
            return 'composite';
          },
          other: function() {
            return 'world';
          }
        };

      expect( function() {
        newclass( [ templateTrait, compositeTrait ] );
      } ).to.throwError( 'There is a merge conflict for the following properties: other,render' );
    });


    it( 'do not throws an exception when conflicts are resolved', function() {
      var
        templateTrait = {
          render: function() {
            return 'template';
          }
        },
        compositeTrait = {
          render: function() {
            return 'composite';
          }
        },

        MyView = newclass( [ templateTrait, compositeTrait ], {
          templateRender: templateTrait.render,
          compositeRender: compositeTrait.render,
          render: function() {
            return this.templateRender() + ' ' + this.compositeRender();
          }
        }),

        aView = new MyView();

      expect( aView.render() ).to.equal( 'template composite' );
    });
  });

  describe('NodeJS inherits compatibility', function () {
    var
      BaseClass = newclass(),
      SubClass = BaseClass.extend();

    it('exposes super_ as a class property', function () {
      expect( SubClass ).to.have.property('super_');
    });

    it('set super_ to the super constructor', function () {
      expect( SubClass.super_ ).to.be( BaseClass );
    });
  });
});


describe('Nil', function() {

  it('has a __super__ property that returns itself', function() {
    expect( Nil.__super__ ).to.equal( Nil.prototype );
  });

  ifNonEnumerablePropertiesAreSupportedIt('has a non-enumerable __super__ property', function() {
    expect( Object.getOwnPropertyDescriptor( Nil, '__super__' ).enumerable ).to.equal( false );
  });

});