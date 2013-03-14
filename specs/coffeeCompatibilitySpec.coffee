factory = (expect, barman) ->
	
	Class = barman.Class
	subclass = barman.subclass
	include = barman.include

	describe 'Barman CoffeeScript Compatibility', ->

		SomeBarmanClass = Class.create
			hello: -> 'Hello World'
			other: -> 'Other'

		describe 'class .. extends', ->
			it 'can use a class defined by Barman', ->

				class MyCoffeeClass extends SomeBarmanClass
					hello: -> super + ' from super'
					other: -> "#{@_callSuper 'other'} called with _callSuper"

				anInstance = new MyCoffeeClass()

				expect( anInstance.hello() ).to.be 'Hello World from super'
				expect( anInstance.other() ).to.be 'Other called with _callSuper'

		describe 'subclass', ->
			class MyCoffeeClass
				hello: -> 'Hello from Coffee'

			it 'can extend a CoffeeScript class', ->
				MyBarmanClass = subclass MyCoffeeClass,
					hello: -> "#{@_callSuper 'hello'} worked!"
				
				anInstance = new MyBarmanClass()

				expect( anInstance.hello() ).to.be 'Hello from Coffee worked!'

			it 'supports traits', ->
				otherTrait =
					other: 'This comes from a trait'

				MyBarmanClass = subclass MyCoffeeClass,
					include otherTrait,
					hello: -> "#{@_callSuper 'hello'} worked!"
				
				anInstance = new MyBarmanClass()

				expect( anInstance.hello() ).to.be 'Hello from Coffee worked!'
				expect( anInstance.other ).to.be 'This comes from a trait'



if typeof define is 'function' and define.amd
	define ['expect', 'barman'], factory

else if typeof module isnt 'undefined' and module.exports
	module.exports = factory(require('expect.js'), require('../src/barman'))

else
	window.coffeCompactibilitySpec = factory(window.expect, window.barman)