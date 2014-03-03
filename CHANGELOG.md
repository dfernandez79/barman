* 0.4.2
  * The property `super_` is now exposed on "classes" to make migrations from
    NodeJS inherits easy.

* 0.4.1
  * `merge` now accepts arrays of objects.
  * Documentation improvements.

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
    You can replace `_callSuper` with the longer 
    `MyClass.__super__.method.call(this, args)` (yes it's ugly but
    `_callSuper` didn't worked as expected in some cases).

* 0.2.4
  * Fixed a bug in `merge` that incorrectly marked a conflict when trying to 
  define an `Object.prototype` function.

  * A workaround was added into integration tests to make them run in IE (see 
  this [mocha issue](https://github.com/visionmedia/mocha/issues/502))

* 0.2.1/0.2.3 - `include` composition changed to throw exceptions when a 
  conflict is found.

  >**Note:** some _patch_ versions were increased due to fixes in comments and 
  Bower tagging. There is no functionality difference between 0.2.1 and 0.2.3.


* 0.2.0

  * Support for Internet Explorer 8

  **API Changes**

  * `_super` was removed, instead use `_callSuper` or `_applySuper`.
  * `withTraits` was renamed to `include` (helpful for people that never heard 
    about traits before).
  * `subclassOf` added as a convenience method to extend non-Barman classes.


* 0.1.1 - Removal of `underscore` dependency. Better documentation (both 
  source and readme). Source code refactoring.


* 0.1.0 - Initial release, it had a dependency with `underscore`.
