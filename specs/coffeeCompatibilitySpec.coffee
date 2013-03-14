factory = (expect, barman) ->
	
	Class = barman.Class

	describe 'Barman CoffeeScript Compatibility', ->

		SomeBarmanClass = Class.create
			hello: -> 'Hello World'
			other: -> 'Other'

		describe 'class .. extends', ->
			it 'can use a class defined by Barman', ->

				class MyCoffeeClass extends SomeBarmanClass
					hello: -> super + ' from super'
					other: -> "#{@_callSuper 'other'} called with _callSuper"

				anInstance = new MyCoffeeClass

				expect( anInstance.hello() ).to.be 'Hello World from super'
				expect( anInstance.other() ).to.be 'Other called with _callSuper'

		describe 'subclass', ->
			it 'can extend a CoffeeScript class'

if typeof define is 'function' and define.amd
	define ['expect', 'barman'], factory

else if typeof module isnt 'undefined' and module.exports
	module.exports = factory(require('expect.js'), require('../src/barman'))

else
	window.barman = factory(window.expect, window.barman)