Barman API
==========

Argument naming conventions:

* `<arg>` means that the argument `arg` is optional
* `[description]` means that the argument is an Array
* `a | b` means that you can use `a` or `b` as an argument. If the argument is optional but you can use two different kind of values `<a | b >` is used.

----

Core concepts
-------------

Probably you'll not use the following objects and methods everyday, but once that you understand them you'll get how the library works.

### Nil

It's the _root_ of all the _classes_ defined in barman:

	var SomeClass = createClass({}); 
	SomeClass.__super__ === Nil.prototype  // true
    
#### Nil.extend / _SomeClass_.extend


	Nil.extend(<factory | [traits]>, <spec>)

Creates a sub-class of the receiver. 

* `factory`: it's a class factory (`isClassFactory(factory) == true`), that takes care of creating a _class_ based on `spec`. If no factory is specified `defaultClassFactory` is used.
* `[traits]`: an array of objects is given as first argument, it's a shortcut for `include(traits)` which uses a class factory that does the trait composition of the given objects.
* `spec`: the interpretation of `spec` depends on the class factory implementation (see `defaultClassFactory` which is the common case).

Every _class_ created in barman has an `extend` method, which is the same as `Nil.extend`: `AnyBarmanClass.extend === Nil.extend`

Methods like `createClass`, `Class.create` or `subclassOf` are just shortcuts to `Nil.extend`.

Internally it does the following:

* If no `factory` is given as the first argument, use `defaultClassFactory`
* Then call `factory.createClass(Receiver, spec)`

### defaultClassFactory

It's the *core* of barman. It takes care of creating _classes_.

Any other method used to create classes ends doing a call to `defaultClassFactory.createClass`.

#### defaultClassFactory.createClass

	createClass( Parent, <instance methods>, <function methods> )

* `Parent`: the parent class.
* `instance methods`: an object that specifies the prototype fields/methods.
* `function methods`: an object that specifies fields/methods to be added into the returned function.

Example:

	var SomeClass = defaultClassFactory.createClass(
		Nil, {hello: 'an instance field'}, {other: 'a function field'});

	SomeClass.other // is 'a function field'
	
	var anInstance = new SomeClass();
	anInstance.hello // is 'an instance field'
	
### AbstractClassFactory

Base class to implement your own class factories. It provides you with two things:

1. `defaultCreateClass`: a method that calls `defaultClassFactory.createClass` for you
2. It marks the instances with a special field. That special field is used by `isClassFactory` to determine if an object is a class factory or not.

### merge

----

Traits
------

### TraitsClassFactory

----

Shortcuts
---------

### Class.create

### createClass

### subclassOf

### include

----

Utilities	
----------

### clone

	clone(obj)
	
Create a shallow copy of an object. It's the same as `Object.create` (but without the optional property attributes). 

A fallback is provided for IE8.

### extend

	extend(target, obj, ...)

Extends `target` by adding or overwriting the properties of the subsequent objects. 



