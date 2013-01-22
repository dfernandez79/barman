barman
=======

_Barman_ is a small library to _brew_ JavaScript objects. It allows you to define objects using [single-inheritance], and [traits].

Its small (2.6k minimized, 1.2k compressed), and plays nice with other frameworks.


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

#### Constructors can be overriden too

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

#### Conflicts can be resolved by setting the implementation to use

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

```shell
npm install barman --save
```

Design notes
------------

References
----------

License
-------

MIT

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)

[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)
