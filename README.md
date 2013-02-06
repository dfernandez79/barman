barman
======

_Barman_ is a small library to _brew_ JavaScript objects. It allows you to define objects using [single-inheritance], and [traits].

It's small, 2.2k minimized - 1k compressed, and plays nice with other frameworks.


Feature tour
------------

The following examples assumes that some variables were defined:

```js
var barman = require('barman'),
    Class = barman.Class,
    required = barman.required,
    withTraits = barman.withTraits;
```
For details on how to load _barman_ in your project, look into the *Installation* section bellow.


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


### Browser

Barman depends only in [some functions][source] from the [underscore] library. And you have several options on how to add it into your web project:

1. Using AMD: The library is designed with AMD in mind, so you don't need any special configuration. Only make the [underscore] dependency available to the barman module.

2. Plain script: load an [underscore] compatible library first, as long you provide a `_` global with the required functions is should work.

3. All-in-one bundle: It's version packaged with the required [underscore] functions using implementations from [mout]. Is intended to be used in a non-AMD setup; for AMD you can use [underscore] or _barman-underscore_ as dependencies.
  
#### Using AMD

##### with underscore

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

##### with an alternative underscore implementation

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

#### Plain script

```html
<script src="underscore-min.js" type="text/javascript"></script>
<script src="barman.min.js"></script>
```

#### All-in-one bundle

```html
<script src="barman.all.min.js"></script>
```

----------------------------------------------------------------

Design notes
------------

#### Why another?

Creating and manipulating objects in JavaScript is very easy: if you need single-inheritance, then set the [prototype chain]; if you need to share methods between objects, then [modify the prototype] directly.
But those operations are low level, which means code duplication and more chances to make mistakes. That's why most frameworks provides their own abstractions.

For example Backbone, Closure, YUI, Dojo, Prototype, and ExtJS, have functions to do [single-inheritance]; but with them you also get a full UI or application framework.

I wanted something small, that only provides abstractions to define objects. So I've evaluated different options:

* [traitsjs]
* [compose]
* [chains]
* [dejavu] - actually it was released when I was already working on barman

All of these libraries had similarities and differences, with more or less features. But they were not exactly what I wanted. It doesn't means that barman is _better_, it's matter of personal needs and preference, so
I encourage you to take a look into those libraries too.

The _design principles_ that guided the creation of barman are:

* **Keep it simple to understand**. For example the concept of _class_ doesn't apply directly to JavaScript,
but it's common for programmers that comes from class based programming languages. So `Class.create` was preferred 
over introducing a new term.

* **Play nice with _standard_ JavaScript**. It means to avoid special method signatures or attributes.

* **Don't re-invent JavaScript**. JavaScript has no type checking, and encapsulation is limited. If you want those
features you'll probably need some external tool and some special attributes and methods to support them. 
I didn't wanted to add those features to barman. If you really want them, probably other options that suits your 
needs are: [dejavu] which provides some limited constraint checking; [Dart] and [Typescript] that are different 
programming languages designed to fix some of the JavaScript issues.

#### Mixins and traits

I based the work on barman in two papers:

* The [mixins paper] from Gilad Bracha.
* The [traits paper] from Stephan Ducasse.

I recommend to read at least the last one, if you want to understand what means _trait_ in the context of barman.

#### Functional mixins

Doing _mixins_ in JavaScript is easy. Just create functions that adds properties to an object:

```js
addMoreMethods(addSomeMethods(MyConstructor.prototype))
```

But this approach has some problems:

* **What happens if `addMoreMethods` and `addSomeMethods` tries to write the same property?**. It depends on how the functions are implemented: probably the last function wins, or maybe an error is thrown, or maybe existing properties are skipped. The thing is that you don't know, and that makes program maintenance hard.

* **What if you want to override a method?** Some people use [function wrappers] to do that. But they are very confusing, for example: what means _before_ or _after_? Is before _my_ function or before the mixin function?
You don't know, it depends on the implementation details of each function.

Besides its problems, I wanted to support functional mixins at the beginning, because is a common JavaScript technique.
From that requirement came the idea of having _class factories_, so the strategy used by `Class.create` can be switched, from mixins:

```js
Class.create(
   withMixins(addMoreMethods, addSomeMethods), 
   { /* methods */ }
);
```

to traits:

```js
Class.create(
   withTraits(t1, t2), 
   { /* methods */ }
);
```

But this approach forces the user to make some decisions before hand: _Should I use traits or mixins? What's the difference?_.

In the end the problems surpasses the benefits, so I decided to remove support for functional mixins. 
But the _class factory_ idea was keep because it makes easy to extend the framework.

#### Method decorations

_Special method_ or _method decorations_ was another idea that seemed good at first, but then I changed my mind. 

What I mean with _special method_? The object that you give to the _class factory_ is an specification of the methods that you want to create. So instead of using functions you can use an object to describe some special case, for example:

```js
SuperClass.extend({
	someMethod: injectSuper(function ($super) {
		// here $super as a bound reference to 
    // someMethod in SuperClass
  });
});
```

Since the _class factoriy_ has access to some metadata, like the method name, it can be used as a kind of _macro_. This idea is used by [compose] and reminds me to some extend to [Groovy AST] transformations.

But I discarded the idea, because of the following reasons:

* Injecting super in that way, like Prototype does, is hard to read, and adds complexity to the handling of function arguments.

* [compose] uses this kind of method specification to have aliases, but after playing with aliases I found that it was better to use a plain function reference: 
```js
// I don't see any advantage of having, this:
{method: from(SuperClass, 'other')}
// over this:
{method: SupeClass.other}
```

### The _aha! moment_: the merge function

A mayor simplification to the framework came while implementing trait composition.

I started with a _Trait_ object, like in [traitsjs], because having a proper reification of the concept is good.

But during the implementation of _trait composition_, I found that the advantage of a proper reification were few compared to the added complexity. 

The _trait composition_ consists of two things:

1. Handling conflicts, with aliases or exclusions.
2. Doing the _method flattening_.

The first can be resolved by comparing the value of conflicting properties.
The second is very easy to do in JavaScript: like with `extend` just join multiple properties into one object.

This two cases can be implemented with a function similar to `extend`, that I called merge (because is similar to a VCS merge):
```js
result = merge(o1, o2)
```
If _o1_ and _o2_ defines the same property but with a different value, the property is replaced with a `conflict` function that throws an error when executed (remember, is not my goal to add a pseudo-type checking to JavaScript). To resolve conflicts, you only need to overwrite the conflicting methods:
```js
result = extend(merge(o1, o2), {prop: impl});
```
In that way choosing which implementation to use is easy:
```js
result = extend(merge(o1, o2), {prop: o1.prop});
```
With this implementation you don't have a proper _Trait class_, but it works and covers all the characteristics of a trait mentioned in the [traits paper].


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
[function wrappers]: https://speakerdeck.com/anguscroll/how-we-learned-to-stop-worrying-and-love-javascript

[traitsjs]: http://soft.vub.ac.be/~tvcutsem/traitsjs/
[compose]: https://github.com/kriszyp/compose
[chains]: https://github.com/stomlinson/Chains
[dejavu]: https://github.com/IndigoUnited/dejavu

[source]: https://github.com/dfernandez79/barman/blob/master/src/barman.js

[Groovy AST]: http://groovy.codehaus.org/Compile-time+Metaprogramming+-+AST+Transformations