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

    var lang = {
        mix: mix,
        recipe: recipe,
        before: before
    };

    function underscoreWithBaristaExtensions() {
        _.mixin(lang);
        return _;
    }

    // Mixins
    // ======

    function parseEvents(events) {
        return events.split(/\s+/);
    }

    var EventListener = recipe({
        constructor: function (callback, context) {
            this.callback = callback;
            this.context = context;
        },
        invoke: function () {
            this.callback.call(this.context);
        },
        matches: function (callback, context) {
            return  !callback || (callback === this.callback && (!context || context === this.context));
        }
    });

    var EventListeners = recipe({
        constructor: function () {
            this.listenersForAllEvents = [];
            this.listeners = {};
        },
        append: function (event, callback, context) {
            this.callbackListFor(event).push(new EventListener(callback, context));
        },
        callbackListFor: function (event) {
            if (event === 'all') {
                return this.listenersForAllEvents;
            } else {
                return this.listeners[event] || (this.listeners[event] = []);
            }
        },
        invokeAllFor: function (event) {
            this._invokeAll(this.listeners[event]);
            this._invokeAll(this.listenersForAllEvents);
        },
        _invokeAll: function (callbacks) {
            if (callbacks) {
                var copy = callbacks.slice(0);
                for (var i = 0; i < copy.length; i++) {
                    copy[i].invoke();
                }
            }
        },
        remove: function (event, callback, context) {
            var listeners = this.listeners[event];
            if (listeners) {
                this.listeners[event] = _.reject(listeners, function (listener) {
                    return listener.matches(callback, context);
                });
                if (this.listeners[event].length === 0) {
                    delete this.listeners[event];
                }
            }
        }
    });

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
                listeners.append(event, callback, context);
            });

            return this;
        };

        proto.off = function (eventsString, callback) {
            var listeners = this._eventListeners;

            if (listeners) {
                _.each(parseEvents(eventsString), function (event) {
                    listeners.remove(event, callback);
                });
            }
            return this;
        };

        proto.trigger = function (eventsString) {
            var listeners = this._eventListeners;

            if (listeners) {
                _.each(parseEvents(eventsString), function (event) {
                    listeners.invokeAllFor(event);
                });
            }
        };
        return proto;
    }

    var mixins = {
        Observable: Observable
    };

    return _.extend({underscore: underscoreWithBaristaExtensions()}, lang, {Mixins: mixins});
});