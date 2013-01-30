barman
=======

_Barman_ is a small library to _brew_ JavaScript objects. It allows you to define objects using [single-inheritance], 
and [traits].

It's small, 2.2k minimized - 1k compressed, and plays nice with other frameworks.


Feature tour
------------

To make things short, the following examples assumes that some variables are defined:

```js
var barman = require('barman'),
    Class = barman.Class,
    required = barman.required,
    withTraits = barman.withTraits;
```

#### Create a _class_

```js
var View = Class.create({
    render: function () {
        return 'View Render';
    }
});

var aView = new View();
aView.render(); // View Render
```


#### Create a _sub-class_

```js
var CustomView = View.extend({
    render: function () {
        return 'Custom';
    }
});

var aView = new CustomView();
aView.render(); // Custom
```


#### The _super class_ constructor is called by default

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


#### _Super class_ delegation, can be done using the `_super` method

```js
var CustomView = View.extend({
    render: function () {
        return 'Custom call to super ' + this._super('render')();
    }
});

var aView = new CustomView();
aView.render(); // Custom call to super View Render
```

#### Constructors can be overridden too

```js
var XPoint = Point.extend({
    constructor: function (x, y) {
        _super('constructor')(x * 10, y * 20);
    }
});
```


#### Method implementations can be shared between classes using _traits_

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
    withTraits(compositeViewTrait),
    {
        subViews: function () {
            return ['sub view 1', 'sub view 2'];
        }
    });

var aView = new CustomView();
aView.render(); // sub view 1, sub view 2
```

#### Traits are represented with plain objects, but they can indicate required methods

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

#### Traits can be composed

```js
var MyView = View.extend(
    withTraits(templateRenderingTrait, compositeViewTrait)
);
```

#### Conflicting methods will throw an exception when executed

```js
(new MyView()).render(); // throws an exception
```

#### Conflicts can be resolved by setting which implementation to use

```js
var MyView = View.extend(
    withTraits(templateRenderingTrait, compositeViewTrait),
        
    compositeRender: compositeViewTrait.render,
    templateRender: templateRenderingTrait.render,
        
    render: function () {
        this.templateRender();
        this.compositeRender();
    });
```

Installation
------------

### Node.js

```shell
npm install barman --save
```

The `--save` argument adds the barman dependency to your `package.json`.


### Browser without AMD

Barman uses some functions from [underscore]. So you'll need to make sure that the `_` global is available:

```html
<script src="underscore-min.js" type="text/javascript"></script>
<script src="barman.min.js"></script>
```

After that you'll have the `window.barman` variable set.

If you are worried about the download size of [underscore] + _barman_, see the **Underscore
dependency** section bellow.

### Browser with AMD

Barman supports AMD without any additional configuration. So you don't need to write an adapter or a
[requirejs] `shim` configuration.

Barman expects an `underscore` module that returns the [underscore] object, so you need to configure it:

 ```js
require.config({
    paths: {
        barman: 'barman.min',
        underscore: 'underscore-min'
    },
    shim: {
        // underscore.js is not an AMD module
        exports: '_'
    }
});

require(['barman'], function (barman) {
    // use it
});
```


### Underscore dependency

Barman uses only a few functions from [underscore]. Those functions are declared at the beginning of the source code,
so is easy to replace them with alternative implementations. For example you can replace it with [mout] or [lodash].

* If you don't use AMD, setup `window._` with the required functions.

* If you use AMD, setup an alternative `underscore` module. Then you can use the `map`
 configuration option added in [requirejs] 2:

```js
require.config({
    paths: {
        barman: 'barman.min',
        'my-underscore': 'my-underscore-impl-for-barman'
    },
    // create an alias of the underscore dependency, just for barman
    map: {
        barman: {
            underscore: 'my-underscore'
        }
    }
});
```

Design notes
------------

#### Why?

Creating and manipulating objects in JavaScript is very easy: if you need single-inheritance, then set the
[prototype chain]; if you need to share methods between objects, then [modify the prototype] directly.
But those operations are low level, which means code duplication and more chances to make mistakes. That's why most of
the frameworks provides their own abstractions.

For example Backbone, Closure, YUI, Dojo, Prototype, and ExtJS, have functions to do [single-inheritance];
but with them you also get a full UI or application framework.

I wanted something small, that only provides abstractions to define objects. So I've evaluated different options:

* [traitsjs]
* [compose]
* [chains]
* [dejavu] - actually it was released when I was already working on barman

All of these libraries had similarities and differences, with more or less features. But they were not exactly
what I wanted. It doesn't means that barman is _better_, is matter of needs and personal preference, so
I encourage you to try those libraries too.

The _design principles_ that guided me during the creation of barman are:

* **Keep it simple to understand**. For example the concept of _class_ doesn't apply directly to JavaScript,
but it's common for programmers that comes from class based programming languages. So I preferred to use
`Class.create` over introducing a new term.

* **Play nice with _standard_ JavaScript**. It means to avoid special method signatures, or adding too many special
attributes.

* **Don't re-invent JavaScript**. JavaScript has no type checking, and encapsulation is limited. If you want those
features you'll probably need some external tool or _non-standard_ attributes and methods. I didn't wanted to add those
features to barman. If you really want them, probably other options suits your needs: [dejavu] provides some limited
constraint checking; [Dart] and [Typescript] are different programming languages designed to fix some of the
JavaScript issues.


#### Functional mixins

Doing _mixins_ in JavaScript is easy. Just create functions that adds properties to an object:

```js
addMoreMethods(addSomeMethods(MyConstructor.prototype))
```

But this approach has some problems:

* **What happens if `addMoreMethods` and `addSomeMethods` tries to write the same property?**. It depends on how the
functions are implemented: probably the last function wins, or maybe the function has some logic to throw an error,
or it decides to not add the property if its already there. The thing is that you don't know, and that makes program
maintenance hard.

* **What if you want to override a method?** Some people use [function wrappers] to do that. But they are very
confusing, for example: what means `before` or `after`? Is before _my_ function or before the mixin function?
You don't know. It depends on the implementation details of each function.


References
----------

License
-------

Released under [MIT license]


[MIT license]: http://opensource.org/licenses/mit-license.php

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)

[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)

[underscore]: http://underscorejs.org/

[lodash]: http://lodash.com/

[mout]: http://moutjs.com/

[requirejs]: http://requirejs.org/

[prototype chain]: https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Inheritance_and_the_prototype_chain
[modify the prototype]: https://developer.mozilla.org/en-US/docs/JavaScript/Guide/Details_of_the_Object_Model#Adding_properties

[traitsjs]: http://soft.vub.ac.be/~tvcutsem/traitsjs/
[compose]: https://github.com/kriszyp/compose
[chains]: https://github.com/stomlinson/Chains
[dejavu]: https://github.com/IndigoUnited/dejavu