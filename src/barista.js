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

    function parseEvents(events) {
        return events.split(/\s+/);
    }

    function invokeAll(callbacks) {
        if (callbacks) {
            var copy = callbacks.slice(0);
            for (var i = 0; i < copy.length; i++) {
                copy[i]();
            }
        }
    }

    var EventListeners = recipe({
        constructor: function () {
            this.listenersForAllEvents = [];
            this.listeners = {};
        },
        append: function (event, callback) {
            this.callbackListFor(event).push(callback);
        },
        callbackListFor: function (event) {
            if (event === 'all') {
                return this.listenersForAllEvents;
            } else {
                return this.listeners[event] || (this.listeners[event] = []);
            }
        },
        invokeAllListenersFor: function (event) {
            invokeAll(this.listeners[event]);
            invokeAll(this.listenersForAllEvents);
        }
    });

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

    function Observable(proto) {
        proto.initializeEventListeners = function () {
            this._eventListeners = new EventListeners();
        };

        proto.constructor = before(proto.constructor, proto.initializeEventListeners);

        proto.on = function (eventsString, callback, context) {
            if (!this._eventListeners) {
                this.initializeEventListeners();
            }

            var listeners = this._eventListeners;
            _.each(parseEvents(eventsString), function (event) {
                listeners.append(event, _.bind(callback, context));
            });
        };

        proto.off = function () {
        };

        proto.trigger = function (eventsString) {
            var listeners = this._eventListeners;

            if (listeners) {
                _.each(parseEvents(eventsString), function (event) {
                    listeners.invokeAllListenersFor(event);
                });
            }
        };
        return proto;
    }

    var lang = {
        mix: mix,
        recipe: recipe
    };

    function underscoreWithBaristaExtensions() {
        _.mixin(lang);
        return _;
    }

    var mixins = {
        Observable: Observable
    };

    return _.extend({underscore: underscoreWithBaristaExtensions()}, lang, {Mixins: mixins});
});