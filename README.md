barman
=======

_Barman_ is a small library to _brew_ JavaScript objects. It allows you to define objects using [single-inheritance], and [traits].

It's small (2.2k minimized, 1k compressed), and plays nice with other frameworks.


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

### Browser without AMD

Barman uses some functions from [underscore], so you'll need to load it:

```html
<script src="underscore-min.js" type="text/javascript"></script>
<script src="barman.min.js"></script>
```

After that you'll have the `window.barman` variable set.
If you are worried about the download size of underscore + barman, which is small by the way, see the underscore
dependency notes bellow.

### Browser with AMD

Barman supports AMD without any additional configuration. So you don't need to write an adapter or declare a
requirejs `shim` configuration.

Barman expects an `underscore` module that returns the underscore object, so you need to configure it:

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

### Node.js

```shell
npm install barman --save
```

The `--save` argument adds the barman dependency to your `package.json`.
Then in your program use `require`, and probably some convenience variables, for example:

```js
var barman = require('barman'),
    Class = barman.Class;
```

### Underscore dependency

Barman uses only a few functions from underscore. Those functions are declared at the beginning of the source code,
so is easy to replace them with alternative implementations:

* If you don't use AMD: Use setup the `_` global, for example using mout, lodash or your own implementation.

* If you use AMD: Setup an alternative `underscore` module. Then you can use the `map`
 configuration option added in RequireJS 2:

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

References
----------

License
-------

Released under [MIT license]


[MIT license]: http://opensource.org/licenses/mit-license.php

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)

[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)
