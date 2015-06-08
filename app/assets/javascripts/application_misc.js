(function() {
    window.t = function(key, options) {
        if (_.isObject(options)) {
            var newOptions = _.clone(options);
            delete newOptions.functionCallContext;
            return _.isFunction(key) ? I18n.t(key.apply(options.functionCallContext, []), newOptions) : I18n.t(key, options);
        } else {
            return I18n.t(key, _.rest(arguments));
        }
    };

    Messenger.options = {
        extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
        theme: 'alpine',
        messageDefaults: {
            // # of seconds the message is displayed to the user before disappearing
            // set to false to require user action to dismiss
            hideAfter: 6,
            showCloseButton: true,
            hideOnNavigate: false
        }
    };

    _.mixin(_.str.exports());

    // make _.include use the method from underscore_string if its argument is a string
    var collectionIncludeMethod = _.include;
    _.include = _.contains = function(collectionOrString) {
        if (_.isString(collectionOrString)) {
            return _.str.include.apply(this, arguments);
        } else {
            return collectionIncludeMethod.apply(this, arguments);
        }
    };

    // set up string.trim if it doesn't exist
    if (!_.isFunction(String.prototype.trim)) {
        String.prototype.trim = function() {
            return _.trim(this);
        };
    }
})();
