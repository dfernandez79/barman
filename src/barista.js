if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    'use strict';

    var _ = require('underscore');

    function mix() {
        var args = _(arguments),
            functions = args.initial(),
            obj = args.last();

        if (_.isFunction(obj)) {
            functions = arguments;
            obj = {};
        }
        return _.compose.apply(_, functions)(obj);
    }

    function basicRecipe(props) {
        var constructor = function () {
        };

        if (props.hasOwnProperty('constructor')) {
            constructor = props.constructor;
        }
        _.extend(constructor.prototype, props);
        return constructor;
    }

    var recipe = _.compose(basicRecipe, mix);

    function before(funcToWrap, func) {
        if (funcToWrap) {
            return _.wrap(funcToWrap, function () {
                var args = _.initial(arguments);
                func.apply(this, args);
                _.last(arguments).apply(this, args);
            });
        } else {
            return func;
        }
    }

    return {
        mix: mix,
        recipe: recipe,
        mixins: {
            dev: {
                before: before
            }
        }
    };
});