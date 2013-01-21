barista
=======

Barista is a small library to _brew_ JavaScript objects. It allows you to define objects using [single-inheritance], and [traits].

Its small (2.6k minimized, 1.2k compressed), and plays nice with other frameworks.


Feature tour
------------

Define a _class_:

    var View = Class.create({
        render: function () {
            return 'View Render';
        }
    });

    var aView = new View();
    aView.render(); // View Render

Extend a _class_:

    var CustomView = View.extend({
        render: function () {
            return 'Custom';
        }
    });

    var aView = new CustomView();
    aView.render(); // Custom

By default the _super class_ constructor is called:

     var Point = Class.create({
             constructor: function ( x, y ) {
                 this.x = x; this.y = y;
             }
         }),

         ColoredPoint = Point.extend({
             color: 'blue',
             show: function () {
                 return 'blue ' + this.x + ', ' + this.y;
             }
         }),

         aPoint = new ColoredPoint(5, 6);
         
    aPoint.show() // blue 5, 6

Delegate to _super class_ method implementation:

    var CustomView = View.extend({
        render: function () {
            return 'Custom call to super ' + this._super('render')();
        }
    });

    var aView = new CustomView();
    aView.render(); // Custom call to super View Render

Re-define the constructor, calling to the one from the _super class_:

    var XPoint = Point.extend({
        constructor: function (x, y) {
            _super('constructor')(x * 10, y * 20);
        }
    });

Share method implementations using _traits_:

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
        });

    var aView = new CustomView();
    aView.render(); // sub view 1, sub view 2

Traits are represented with plain objects, but they can indicate required methods:

    var templateRenderingTrait = {
        template: required,
        $el: required,
        
        render: function () {
            this.$el.html(this.template());
            return this;
        }
    };

Traits can be composed:

    var MyView = View.extend(
        withTraits(templateRenderingTrait, compositeViewTrait)
    );

Conflicting methods will throw an exception when executed:

    (new MyView()).render(); // throws an exception

Conflicts can be resolved by setting the implementation to use:

    var MyView = View.extend(
        withTraits(templateRenderingTrait, compositeViewTrait),
        
        compositeRender: compositeViewTrait.render,
        templateRender: templateRenderingTrait.render,
        
        render: function () {
            this.templateRender();
            this.compositeRender();
        }
    );



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
