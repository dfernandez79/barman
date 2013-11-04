barman = require('../lib/index')
expect = require('expect.js')

createClass = barman.createClass
subclassOf = barman.subclassOf
include = barman.include

describe 'Barman CoffeeScript Compatibility', ->
  SomeBarmanClass = createClass
    hello: ->
      'Hello World'
    other: ->
      'Other'

  describe 'class .. extends', ->
    it 'can use a class defined by Barman', ->
      class MyCoffeeClass extends SomeBarmanClass
        hello: ->
          super + ' from super'

      anInstance = new MyCoffeeClass()

      expect(anInstance.hello()).to.equal 'Hello World from super'

  describe 'subclassOf', ->
    class MyCoffeeClass
      hello: ->
        'Hello from Coffee'

    it 'can extend a CoffeeScript class', ->
      MyBarmanClass = subclassOf MyCoffeeClass,
        hello: ->
          "#{MyBarmanClass.__super__.hello.call(this)} worked!"

      anInstance = new MyBarmanClass()

      expect(anInstance.hello()).to.equal 'Hello from Coffee worked!'

    it 'supports traits', ->
      otherTrait =
        other: 'This comes from a trait'

      MyBarmanClass = subclassOf MyCoffeeClass,
        include otherTrait,
          hello: ->
            "#{MyBarmanClass.__super__.hello.call(this)} worked!"

      anInstance = new MyBarmanClass()

      expect(anInstance.hello()).to.equal 'Hello from Coffee worked!'
      expect(anInstance.other).to.equal 'This comes from a trait'