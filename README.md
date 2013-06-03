Barman [![Build Status](https://travis-ci.org/dfernandez79/barman.png)](https://travis-ci.org/dfernandez79/barman) [![NPM version](https://badge.fury.io/js/barman.png)](http://badge.fury.io/js/barman)
======

_Barman_ is a small library to _brew_ JavaScript objects.

It simplifies the definition of objects using [single-inheritance] and [traits like][traits] composition.

It works with [Nodejs] and all mayor browsers, including IE 8.


----------------------------------------------------------------
Installation
------------

### Node.js

```shell
npm install barman --save
```

### Browser

_Barman_ doesn't have any external dependency, you can load it directly or with [AMD]:
 
* **dist/barman.min.js**: minimized with a [source map] link for easy debugging.
* **src/barman.js**: full source including comments.

_Barman_ is also available on [cdnjs], and as [Twitter Bower] package:

```shell
bower install barman
```


----------------------------------------------------------------
Feature walkthrough
-------------------

First **define some convenient variables**:

```js
var barman = require('barman'),
    Class = barman.Class,
    required = barman.required,
    include = barman.include;
```

To **define a _class_**, use `Class.create` ([run on jsfiddle](http://jsfiddle.net/XHT4K/1/)): 

```js
var Message = Class.create({
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
>**Ey! JavaScript doesn't have classes!** That's true, see the [design notes] for an explanation why I choose this name. 
To summarize: JavaScript allows [single-inheritance] (with prototype delegation) and a good way to understand mixins 
and traits is as a complement of [single-inheritance]. I could come up with a new term, but I hope that `Class.create` is
more _friendly_.

To **create a sub-class**, use `extend` ([run on jsfiddle](http://jsfiddle.net/LynWL/)):

```js
var ColoredMessage = Message.extend({
    color: 'red',
        
    createElement: function () {
        return $('<div></div>').text('Hello Barman!').css('color', this.color);
    }
});
                                        
// Append a red "Hello Barman!" message to #container
new ColoredMessage().appendTo($('#container'));
```

We have some code duplication here. Let's **use `_callSuper` to call the super-class implementation** ([run on jsfiddle](http://jsfiddle.net/LynWL/5/)):

```js
var ColoredMessage = Message.extend({
    color: 'red',
    
    createElement: function () {
        return this._callSuper('createElement').css('color', this.color);
    }
});
```    

Saying always _"Hello Barman!"_ is boring, a `Message` **constructor** in  will help ([run on jsfiddle](http://jsfiddle.net/LynWL/6/)):

```js
var Message = Class.create({
    constructor: function (msg) {
        this.message = msg;
    },
    
    appendTo: function (aContainer) {
        aContainer.append(this.createElement());
    },
    
    createElement: function () {
        return $('<div></div>').text(this.message);        
    }
});
```

Note that `ColoredMessage` doesn't define any constructor, **by default the super-class constructor is used** ([run on jsfiddle](http://jsfiddle.net/LynWL/6/)):

```js
new ColoredMessage("My Message").appendTo($('#container'));
```

`_callSuper` can be used also to **call** the **super-class constructor** ([run on jsfiddle](http://jsfiddle.net/LynWL/7/)):

```js
var ColoredMessage = Message.extend({
    color: 'red',
    
    constructor: function (msg, color) {
        this._callSuper('constructor', msg);
        this.color = color;
    },
    
    createElement: function () {
        return this._callSuper('createElement').css('color', this.color);
    }
});
                                    
new ColoredMessage("My Message", 'blue').appendTo($('#container'));
```

Now we are going to **refactor** our example **using [traits]**:

* `AppendableElement`: defines the behavior of `appendTo`.
* `TemplateBased`: defines the behavior of `createElement` based on a template.

```js
var AppendableElement = {
    createElement: required,    
    appendTo: function (aContainer) {
        aContainer.append(this.createElement());
    }        
};
var TemplateBased = {
    template: required,
    renderTemplate: function () {
        var templateData = this;
        return this.template.replace(/{([^{}]+)}/g, function(m, key) {
            return templateData[key];
        });
    },
    createElement: function () {
        return $(this.renderTemplate());    
    }
};
```

Using **include** we can **mix** `AppendableElement` and `TemplateBased` into the `Message` class ([run on jsfiddle](http://jsfiddle.net/LynWL/8/)):

```js
var Message = Class.create( include(TemplateBased, AppendableElement), {      
    template: '<div>{message}</div>',
    
    constructor: function (msg) {
        this.message = msg;
    }
}); 
```

If there is a **conflict**, _Barman_ will throw an **exception** ([run on jsfiddle](http://jsfiddle.net/LynWL/9/)):

```js
var CompositeElement = {
    createContainer: required,
    childs: required,
    createElement: function () {
        return this.createContainer().append(
                this.childs.map(function (child) {
                    return child.createElement();
                }));
    }
};
// ...
// This throws an exception both CompositeElement and TemplateBased defines createElement
var MessageComposite = Class.create(
    include(AppendableElement, CompositeElement, TemplateBased), {
     
    template: '<div></div>',
         
    constructor: function () {
        this.childs = Array.prototype.slice.call(arguments, 0);  
    },
         
    createContainer: function () {
        return $('<div></div>');
    }
});

```

To **resolve a conflict just set the proper implementation** ([run on jsfiddle](http://jsfiddle.net/LynWL/10/)):

```js
var MessageComposite = Class.create(
    include(AppendableElement, CompositeElement, TemplateBased), {
     
    template: '<div></div>',
         
    constructor: function () {
        this.childs = Array.prototype.slice.call(arguments, 0);  
    },
         
    createElement: CompositeElement.createElement,
    createContainer: TemplateBased.createElement
});

```

### CoffeeScript compatibility

CoffeeScript classes can extend Barman classes ([run on jsfiddle](http://jsfiddle.net/u8VEF/)):

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

The _subclassOf_ method can be used to extend CoffeeScript classes with _traits_ ([run on jsfiddle](http://jsfiddle.net/LFZnK/1/)):

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

For development you'll need [Nodejs], and [Grunt]. 
Before contributing execute `grunt dist` to run the linter and unit tests.

The [design notes] are a good starting point to understand 
the source code and design of the library. 


----------------------------------------------------------------
Change log
----------

* 0.2.4
  * Fixed a bug in `merge` that incorrectly marked a conflict when trying to define an `Object.prototype` function.
  
  * A workaround was added into integration tests to make them run in IE (see this [mocha issue](https://github.com/visionmedia/mocha/issues/502))
  
* 0.2.1/0.2.3 - `include` composition changed to throw exceptions when a conflict is found.

  >**Note:** some _patch_ versions were increased due to fixes in comments and Bower tagging. There is no functionality difference between 0.2.1 and 0.2.3.


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

[cdnjs]: http://cdnjs.com/
[design notes]: https://github.com/dfernandez79/barman/blob/master/docs/notes.md

[MIT license]: http://opensource.org/licenses/mit-license.php

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)
[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)
[mixins]: http://en.wikipedia.org/wiki/Mixins
[source map]: http://net.tutsplus.com/tutorials/tools-and-tips/source-maps-101/

[AMD]: http://requirejs.org/docs/whyamd.html#amd
[Nodejs]: http://nodejs.org/
[Grunt]: http://gruntjs.com/
[Twitter Bower]: http://bower.io/
