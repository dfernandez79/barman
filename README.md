barista
=======

Barista is a small library to _brew_ JavaScript objects.

It allows you to define objects using [single-inheritance], and [traits].

Feature tour
------------

```js
var View = Class.create({

    render: function () {
        return 'View Render';
    }

});


var aView = new View();

aView.render(); // View Render
```

```js
var CustomView = View.extend({

    render: function () {
        return 'Custom';
    }

});


var aView = new CustomView();

aView.render(); // Custom
```

```js
var CustomView = View.extend({

    render: function () {
        var super = this._super('render');
        return 'Custom call to super ' + this._super('render')();
    }

});


var aView = new CustomView();

aView.render(); // Custom call to super View Render
```

```js
var View = Class.create({
    name: 'Super',

    render: function () {

        return 'render: ' + this.name;

    }
};

var CustomView = View.extend({
    name: 'Custom';

    render: function () {
        var superRender = this._super('render');
        return 'call to superRender ' + superRender();
    }

});


var aView = new CustomView();

aView.render(); // call to superRender render: Custom
```

```js
var View = Class.create({
    render: function () {
        return 'default render';
    }
};

var compositeViewTrait = {
    subViews: mustBeImplemented('Return an array of sub-views'),

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
    }
});


var aView = new CustomView();

aView.render(); // sub view 1, sub view 2
```


Installation
------------

Design notes
============

References
==========

License
-------

MIT

[single-inheritance]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)

[traits]: http://en.wikipedia.org/wiki/Trait_(computer_programming)
