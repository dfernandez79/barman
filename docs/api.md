#### Class.create( _\[classFactory\]_, _args_ )

It's a shortcut to `Nil.extend`.

// #### subclassOf( _Parent_, _args_ )
//
// A shortcut to `Nil.extend`, that makes easy to sub-class non-barman classes.
//

// #### include( _trait_, ... )
//
// A nice way to create a `TraitsClassFactory` instance.
//


// Default class factory
// ---------------------

// Extension and creation of _classes_ is delegated to _ClassFactory_ objects.
//
// Those objects are marked with the special attribute `CLASS_FACTORY_ATTRIBUTE`, so they can be distinguished
// by _Class.create_ and _Nil.extend_.
//


// #### markAsClassFactory(_obj_)
//
// Adds the `CLASS_FACTORY_ATTRIBUTE` to an object.
//

// #### isClassFactory(_obj_)
//
// Returns true if the object is marked as a class factory.
//

// ### defaultClassFactory object
//
// It's the default implementation of a _ClassFactory_, and one of the _core_ functions of *barman*.
//
// #### createClass( _Parent_, _instanceMethods_, _staticMethods_ )
//

// * Clone the `Parent.prototype` and extend it with the sub-class methods.
// * Check if we define a _constructor_, if not define one that calls the parent constructor.
// * Extend the constructor function with the `staticMethods`.
// * Add the `__super__` property to the constructor
// * Finally ensure that the constructor has the right prototype and `extend` function. Note that
// you can't redefine `extend` with the `staticMethods`, if you want to customize `extend` use a
// _ClassFactory_.

// #### Nil.extend( _\[classFactory\]_, _args_ )
//
// If no `classFactory` is given it uses `defaultClassFactory`. The interpretation of the rest arguments depends
// on the _ClassFactory_, see `defaultClassFactory.createClass`.
//
// AbstractClassFactory
// --------------------

// Base class for custom class factories. It defines the class factory marker attribute, and provides
// a convenience method to call the `defaultClassFactory`.
//

// Nil
// ---

// `Nil` is the root of the *barman* _class hierarchy_.
// Every *barman* _class_ has a `__super__` property that returns the parent prototype.
// The parent of `Nil` is `Nil`. This is for compatibility with other frameworks (ie. CoffeeScript, Backbone).

// Merge
// -----

// `merge` is one of the main functions of *barman*.
//
// It's similar to the commonly used `extend({}, o1,...,oN)`, but it uses the following strategy
// for overwriting properties:
//
// * if values are different, the destination property is marked as `conflict`
// * if one of the values is marked as `required`, the destination property uses the value not marked as
//   required


// ### Merge helper functions

// #### mapProperties(_srcObj_, _iterator_, _result_)
//
// Returns a new object where each property is the result of applying the `iterator` function over `srcObj`:
//
//     result.prop = iterator(srcObj.prop, 'prop');
//
// _result_ is optional, and an empty object will be used if it's omitted.
//

// #### conflict()
//
// Throws an error. Used to indicate _merge conflicts_.
//


// #### required()
//
// Throws an error. Used to indicate that an implementation is required.
//


// #### mergeProperty(_value_, _prop_)
//
// Used by `merge` to map each property.
//

// #### merge(_object_,...)
//
// Returns a new object, that is the result of merging the properties of each one of the given objects.
//
        // If the property is not defined directly in the target object (note the target object always starts
        // as {} so if is not defined there directly is an property defined by Object.prototype),
        // or both values are the same,
        // or the target value is the `required` marker; use the given `value`.

        // If the given `value` is the `required` marker, use the existing property value.

        // If both values are different, but not undefined or required, return the `conflict` marker.

---------
// #### isUndefined( _value_ )
//
// A shortcut for `typeof`.
//
// #### isFunction( _value_ )
//
// A shortcut for `typeof`.
//
// #### has( _object_, _property_ )
//
// A _safe_ version of `hasOwnProperty`.
//
// #### isObject( _value_ )
//
// Check if _value_ it's an object. It handles the _null_ corner case better than `typeof`.
//
// ### Each helper functions
//
// Of all the common helper functions `each` is the only one that differs from _underscore_ or
// _lodash_. The main difference is that it ensures to iterate over the JScript (IE < 9) hidden
// object properties.
//
// JScript has a known bug in `for.. in` loops that ignores some redefined `Object` properties. The
// `JSCRIPT_NON_ENUMERABLE` array contains those ignored properties, so we iterate over them in the `each`
// function.
//
// #### eachKey( _obj_, _func_, _context_ )
//
// The special case for JScript is handled by different implementations of the `eachKey` internal function.
//

//
// **eachKeyStd** is the _standard_ implementation of _eachKey_.
//
//
// **eachKeyFix** is an implementation of _eachKey_ that uses a workaround for JScript buggy enumeration.
//
// The proper `eachKey` implementation is defined according to `enumObjectOverrides`.
// #### each( _obj_, _func_, _context_ )
//
// Same as <http://underscorejs.org/#each> but takes account of the special JScript case.
//
// #### extend( _obj_, ... )
//
// Same as <http://underscorejs.org/#extend> but uses `each` to iterate, so we handle the JScript special case
// properly.
//
// #### clone( _obj_ )
//
// Makes a shallow clone on an object. If the JavaScript engine implements `Object.create` we use it. If not
// we fallback to the usual "clone by using new" approach.
//
// #### defineSpecialProperty( _obj_, _name_, _value_ )
//
// Defines a property that will be used internally by the framework.
// The property will be non-enumerable, non-writable and non-configurable
// (if the JS engine supports property descriptors).
//

// The proper `defineSpecialProperty` implementation is if the engine supports non-enumerable properties




