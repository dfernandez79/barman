Barman [![Build Status](https://travis-ci.org/dfernandez79/barman.png)](https://travis-ci.org/dfernandez79/barman)
======

_Barman_ is a small library to _brew_ JavaScript objects. It allows you to define objects using [single-inheritance] and [traits].

It's small and plays nice with other frameworks.


----------------------------------------------------------------
Installation
------------

### Node.js

```shell
npm install barman --save
```

The `--save` option adds the dependency to your `package.json`.

### Browser

Barman was tested on IE 8, Firefox, Safari, and Chrome. It can be loaded as a plain script or using [AMD]:

* When loaded as a plain script, a global called `barman` will be added to the `window` object.
* When loaded using [AMD], the `barman` object is returned by the module and no global will be created.

In both cases you can use the minified version: `dist/barman.min.js`, which includes a [source map]; or the full source: `src/barman.js`.

----------------------------------------------------------------
Examples
--------

The following examples assumes that some variables were defined:

```js
var barman = require('barman'),
    Class = barman.Class,
    required = barman.required,
    include = barman.include;
```


### Create a _class_

```js
var View = Class.create({
    render: function () {
        return 'View Render';
    }
});

var aView = new View();
aView.render(); // View Render
```


### Create a _sub-class_

```js
var CustomView = View.extend({
    render: function () {
        return 'Custom';
    }
});

var aView = new CustomView();
aView.render(); // Custom
```


### The _super class_ constructor is called by default

```js
var Point = Class.create({
        constructor: function ( x, y ) {
            this.x = x; this.y = y;
        }
    }),

    ColoredPoint = Point.extend({
        color: 'red',
        show: function () {
            return this.color + ' ' + this.x + ', ' + this.y;
        }
    }),

    aPoint = new ColoredPoint(5, 6);
    
aPoint.show() // red 5, 6
```


### _Super class_ delegation, can be done using _\_callSuper_

```js
var CustomView = View.extend({
    render: function () {
        return 'Custom call to super ' + this._callSuper('render');
    }
});

var aView = new CustomView();
aView.render(); // Custom call to super View Render
```


### Constructors can be overridden too

```js
var XPoint = Point.extend({
    constructor: function (x, y) {
        this._callSuper('constructor', x * 10, y * 20);
    }
});
```


### Method implementations can be shared between classes using _traits_

```js
var View = Class.create({
    render: function () {
        return 'default render';
    }
};

var compositeViewTrait = {
    subViews: required,

    render: function() {
        return this.subViews().join();
    }
};

var CustomView = View.extend(
    include(compositeViewTrait),
    {
        subViews: function () {
            return ['sub view 1', 'sub view 2'];
        }
    });

var aView = new CustomView();
aView.render(); // sub view 1, sub view 2
```


### Traits are represented with plain objects, and they can indicate required methods

```js
var templateRenderingTrait = {
    template: required,
    $el: required,
        
    render: function () {
        this.$el.html(this.template());
        return this;
    }
};
```


### Traits can be composed

```js
var MyView = View.extend(
    include(templateRenderingTrait, compositeViewTrait)
);
```


### Conflicting methods will throw an exception when composed

```js
var templateViewTrait = {render: function () { return 'template'; } },
    compositeViewTrait = {render: function() { return 'composite'; } };

var MyView = View.extend(
    include(templateRenderingTrait, compositeViewTrait)
); // throws an exception: render is defined by templateRenderingTrait and compositeViewTrait
```


### Conflicts can be resolved by setting which implementation to use

```js
var MyView = View.extend(
    include(templateRenderingTrait, compositeViewTrait),
    
    // aliases to trait methods    
    compositeRender: compositeViewTrait.render,
    templateRender: templateRenderingTrait.render,
    
    // re-defines the conflicting render method    
    render: function () {
        this.templateRender();
        this.compositeRender();
    });
```

### CoffeeScript compatibility

#### CoffeeScript classes can extend Barman classes
```coffee
SomeBarmanClass = Class.create
    hello: -> 'Hello World'
    other: -> 'Other'

class MyCoffeeClass extends SomeBarmanClass
    hello: -> super + ' from super'
    other: -> "#{@_callSuper 'other'} called with _callSuper"

anInstance = new MyCoffeeClass()
anInstance.hello() # returns "Hello world from super"
anInstance.other() # returns "Other called with _callSuper"
```

#### The _subclassOf_ method can be used to extend CoffeeScript classes with _traits_
```coffee
class MyCoffeeClass
    hello: -> 'Hello from Coffee'

otherTrait = other: 'This comes from a trait'

MyBarmanClass = subclassOf MyCoffeeClass,
    include otherTrait,
    hello: -> "#{@_callSuper 'hello'} worked!"

anInstance = new MyBarmanClass()

anInstance.other # returns "This comes from a trait"
```


----------------------------------------------------------------
Development
-----------

If you are going to fork this project, you'll need these tools:

* [Nodejs]
* [Grunt]

Before contributing with a _pull request_ do a `grunt dist` to run the linter and unit tests.

To understand the source code, or create your own library, see the [design notes].


### Running _integration tests_

The intention of _integration tests_ is to test barman in a browser environment.
When you execute `grunt integration-test` tests are run using [PhantomJS].

You can also run the integration tests directly from your browser:

1. If you made changes, run `grunt uglify` to generate the minimized files in `dist`.
2. Open the html files inside `integration-tests`.

If opening the html files directly doesn't work because of security restrictions to the `file:///` protocol, you can use a small static web server.
[Python] provides a simple HTTP server that you can use in any platform by running:

```shell
python -m SimpleHTTPServer port
```

Where _port_ is the port to listen for incoming connections.

Be sure to run the HTTP server from the project root since html pages will try to use `../dist` and `../specs`.


----------------------------------------------------------------
Change log
----------

* 0.2.1

  * `include` composition changed to throw an exception early.


* 0.2.0

  * Support for Internet Explorer 8

  **API Changes**
  
  * `_super` was removed, instead use `_callSuper` or `_applySuper`
    
       Why? "super" is used for method delegation, so it makes no sense to use `_super()`.

       With `_super('methodName')()` is easy to miss the extra parenthesis of the function invocation, passing parameters
       for a variable arguments methods forces you to use the long `_super('methodName').apply(this, arguments)` syntax.

       The new methods are shorter to write and read: `_callSuper('methodName')` or `_applySuper('methodName', arguments)`.

  * `withTraits` was renamed to `include`, this is helpful for people that never heard about traits before.

  * `subclassOf` added as a convenience method to extend non-Barman classes.


* 0.1.1 - Removal of `underscore` dependency. Better documentation (both source and readme). Source code refactoring.


* 0.1.0 - Initial release, it had a dependency with `underscore`.

----------------------------------------------------------------
License
-------

Released under [MIT license]


[design notes]: https://github.com/dfernandez79/barman/blob/master/docs/notes.md

[MIT license]: http://opensource.org/licenses/mit-license.php

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)
[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)
[mixins]: http://en.wikipedia.org/wiki/Mixins
[source map]: http://net.tutsplus.com/tutorials/tools-and-tips/source-maps-101/

[AMD]: http://requirejs.org/docs/whyamd.html#amd
[Nodejs]: http://nodejs.org/
[Grunt]: http://gruntjs.com/
[PhantomJS]: http://phantomjs.org/
