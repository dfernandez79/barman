Barman
======
[![Build Status](https://travis-ci.org/dfernandez79/barman.png)](https://travis-ci.org/dfernandez79/barman) 
[![NPM version](https://badge.fury.io/js/barman.png)](http://badge.fury.io/js/barman) 
[![devDependency Status](https://david-dm.org/dfernandez79/barman/dev-status.png)](https://david-dm.org/dfernandez79/barman#info=devDependencies)

_Barman_ is a small library to _brew_ JavaScript objects.

It simplifies the definition of objects using [single-inheritance] and [traits like][traits] composition.

It works with [Nodejs] and all mayor browsers, including IE 8.


-------------------------------------------------------------------------------
Installation
------------

### Node.js

```sh
npm install barman --save
```

### Browser

_Barman_ doesn't have any dependency to be used. 
It can be loaded directly or using [AMD]:

* **dist/barman.min.js**: minimized, with a [source map] availble on 
  **dist/barman.min.js.map**.

* **dist/barman.js**: full source.

_Barman_ is also available on [cdnjs], and as a [Bower] package:

```sh
bower install barman
```


-------------------------------------------------------------------------------
Feature walkthrough
-------------------

**Define a _class_**, using `newclass` 
([run on jsfiddle](http://jsfiddle.net/diegof79/XHT4K/3/)):

```js
var Message = barman.newclass({
    appendTo: function (aContainer) {
        aContainer.append(this.createElement());
    },

    createElement: function () {
        return $('<div></div>').text('Hello Barman!');
    }
});

// Append "Hello Barman!" to #container
new Message().appendTo($('#container'));
```

**Create a sub-class**, using `ExistingClass.extend` 
([run on jsfiddle](http://jsfiddle.net/diegof79/LynWL/20/)):

```js
var ColoredMessage = Message.extend({
    color: 'red',

    createElement: function () {
        return $('<div></div>')
            .text('Hello Barman!')
            .css('color', this.color);
    }
});

// Append a red "Hello Barman!" message to #container
new ColoredMessage().appendTo($('#container'));
```

**Access to the super-class implementation** using `ThisClass.__super__` 
([run on jsfiddle](http://jsfiddle.net/diegof79/LynWL/21/)):

```js
var ColoredMessage = Message.extend({
    color: 'red',

    createElement: function () {
        var superCreateElem = ColoredMessage.__super__.createElement;
        return superCreateElem.call(this).css('color', this.color)
    }
});
```

**Constructors are automatically inherited** 
([run on jsfiddle](http://jsfiddle.net/diegof79/LynWL/22/)):

```js
var Message = barman.newclass({
    // A constructor is added to the super class
    constructor: function (msg) {
        this.message = msg;
    },
    /* ... */
});

var ColoredMessage = Message.extend({/* ... */ });

// ColoredMessage(msg) is available by default 
// (you can avoid it by defining your own constructor)
new ColoredMessage("My Message").appendTo($('#container'));
```

**Mixins** can be added to a class definition:

```js
// Defines the behavior of appendTo, requires createElemn
var AppendableElement = {
    appendTo: function (aContainer) {
        aContainer.append(this.createElement());
    }
};
var Message = barman.newclass(
    [ AppendableElement ],
    {
       // appendTo is now provided by AppendableElement
       // it requires createElement to be defined
    });
```    

Mixins and classes can indicate **required fields** using `required`:

```js
// Defines the behavior of appendTo, requires createElemn
var AppendableElement = {
    createElement: barman.required,
    appendTo: function (aContainer) {
        aContainer.append(this.createElement());
    }
};
var Message = barman.newclass(
    [ AppendableElement ],
    {
       // appendTo is now provided by AppendableElement
       // it requires createElement to be defined:
       createElement: function () { /*...*/ }
    });
```

**Mixins can be composed in any order** 
([run on jsfiddle](http://jsfiddle.net/diegof79/LynWL/24/)):

```js
// TemplateBased provides an implementation for createElement
var TemplateBased = {
    template: barman.required,
    renderTemplate: function () {
        // omited for brevity, see the example on jsfiddle
    },
    createElement: function () {
        return $(this.renderTemplate());
    }
};

var Message = barman.newclass(
    // using [AppendableElement, TemplateBased] will give the same result
    [ TemplateBased, AppendableElement ],
    {
        template: '<div>{message}</div>',

        constructor: function (msg) {
            this.message = msg;
        }
    });
```

A composition **conflict** throws an **exception** 
([run on jsfiddle](http://jsfiddle.net/diegof79/LynWL/25/)):

```js
var CompositeElement = {
    createContainer: required,
    childs: required,
    createElement: function () { /* ... */ }
};
// ...
// throws an exception both CompositeElement 
// and TemplateBased defines createElement
var MessageComposite = barman.newclass(
     [ AppendableElement, CompositeElement, TemplateBased ],
     {
        /* ... */
     });
```

**Conflicts can be resolved** by setting which implementation to use 
([run on jsfiddle](http://jsfiddle.net/diegof79/LynWL/26/)):

```js
var MessageComposite = barman.newclass(
    [ AppendableElement, CompositeElement, TemplateBased ], {

    /* ... */

    createElement: CompositeElement.createElement,
    createContainer: TemplateBased.createElement
});
```

### CoffeeScript compatibility

CoffeeScript classes can extend Barman classes 
([run on jsfiddle](http://jsfiddle.net/diegof79/u8VEF/3/)):

```coffee
SomeBarmanClass = barman.newclass
    hello: -> 'Hello World'

class MyCoffeeClass extends SomeBarmanClass
    hello: -> super + ' from super'

anInstance = new MyCoffeeClass()
anInstance.hello() # returns "Hello world from super"
```

_newclass_ can be used to extend CoffeeScript classes with _traits_
([run on jsfiddle](http://jsfiddle.net/diegof79/LFZnK/5/)):

```coffee
class MyCoffeeClass
    hello: -> 'Hello from Coffee'

otherTrait = other: 'This comes from a trait'

MyBarmanClass = barman.newclass MyCoffeeClass, [otherTrait]

anInstance = new MyBarmanClass()

anInstance.other # returns "This comes from a trait"
anInstance.hello # returns "Hello from Coffee"
```

-------------------------------------------------------------------------------
Development
-----------

For development you'll need [Nodejs], and [Grunt].

Before contributing execute `grunt dist` to run _jshint_ and _tests_.

Useful [Grunt] tasks:

* **default**: Runs jshint and test.
* **test**: Runs tests on [Nodejs].
* **integration-test**: Runs tests on [PhantomJS]. This task also generates 
  files to run tests on the browser (see the `.tmp` directory or run the 
  `dev` task).
* **dist**: Runs all the tests and generates the minified files.
* **dev**: Starts a web server for test pages (port 9001). Changes are 
  automatically updated.


-------------------------------------------------------------------------------
Change log
----------
* 0.4.0
  * Mayor source code re-organization.
  * Browser bundles are generated using Browserify.
 
  **API Changes**

  * `Class.create`, `include`, `subclassOf` **has been removed and replaced 
    by `newclass`**.
  * An equivalent method to `newclass` but for object instances called `mix` 
    has been added.
  * The previous _non-public_ implementation using _class factories_ 
    has been removed.

* 0.3.0
  * **Breaking change**: `_callSuper` and `_applySuper` were removed. 
    See the [design notes] to understand why.
    You can replace `_callSuper` with the longer `MyClass.__super__.method.call(this, args)` (yes it's ugly but
    `_callSuper` didn't worked as expected in some cases).

* 0.2.4
  * Fixed a bug in `merge` that incorrectly marked a conflict when trying to define an `Object.prototype` function.

  * A workaround was added into integration tests to make them run in IE (see this [mocha issue](https://github.com/visionmedia/mocha/issues/502))

* 0.2.1/0.2.3 - `include` composition changed to throw exceptions when a conflict is found.

  >**Note:** some _patch_ versions were increased due to fixes in comments and Bower tagging. There is no functionality difference between 0.2.1 and 0.2.3.


* 0.2.0

  * Support for Internet Explorer 8

  **API Changes**

  * `_super` was removed, instead use `_callSuper` or `_applySuper`.
  * `withTraits` was renamed to `include` (helpful for people that never heard about traits before).
  * `subclassOf` added as a convenience method to extend non-Barman classes.


* 0.1.1 - Removal of `underscore` dependency. Better documentation (both source and readme). Source code refactoring.


* 0.1.0 - Initial release, it had a dependency with `underscore`.

----------------------------------------------------------------
License
-------

Released under [MIT license]

[cdnjs]: http://cdnjs.com/
[design notes]: https://github.com/dfernandez79/barman/blob/master/docs/notes.md
[paper]: http://scg.unibe.ch/archive/papers/Scha03aTraits.pdf

[MIT license]: http://opensource.org/licenses/mit-license.php

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)
[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)
[mixins]: http://en.wikipedia.org/wiki/Mixins
[source map]: http://net.tutsplus.com/tutorials/tools-and-tips/source-maps-101/

[AMD]: http://requirejs.org/docs/whyamd.html#amd
[Nodejs]: http://nodejs.org/
[Grunt]: http://gruntjs.com/
[Bower]: http://bower.io/
[PhantomJS]: http://phantomjs.org/
