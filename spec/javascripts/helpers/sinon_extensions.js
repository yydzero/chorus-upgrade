_.extend(sinon.fakeServer, {

    reset: function() {
        this.requests = [];
    },

    creates: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "POST";
        });
    },

    fetches: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "GET";
        });
    },

    updates: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "PUT";
        });
    },

    destroys: function() {
        return _.filter(this.requests, function(request) {
            return request.method === "DELETE";
        });
    },

    lastRequest: function() {
        return _.last(this.requests);
    },

    lastCreate: function() {
        return _.last(this.creates());
    },

    lastFetch: function() {
        return _.last(this.fetches());
    },

    lastUpdate: function() {
        return _.last(this.updates());
    },

    lastDestroy: function() {
        return _.last(this.destroys());
    },

    lastUpdateFor: function(model) {
        return _.last(_.filter(this.updates(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url({method: "update"}));
            return uri.equals(modelUri);
        }));
    },

    lastDestroyFor: function(model) {
        return _.last(_.filter(this.destroys(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url({method: "destroy"}));
            return uri.equals(modelUri);
        }));
    },

    lastCreateFor: function(model) {
        return _.last(_.filter(this.creates(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url({method: "create"}));
            return uri.equals(modelUri);
        }));
    },

    lastFetchFor: function(model, options) {
        options = options || {};
        options.method = 'read';
        return _.last(_.filter(this.fetches(), function(potentialRequest) {
            var uri = new URI(potentialRequest.url);
            var modelUri = new URI(model.url(options));

            if (!options.requireRows) {
                uri.removeSearch("per_page");
                modelUri.removeSearch("per_page");
            }
            return uri.equals(modelUri);
        }));
    },

    lastFetchAllFor: function(model, overrides) {
        return this.lastFetchFor(model, _.extend({ per_page: 1000, requireRows: true}, overrides));
    },

    makeFakeResponse: function(modelOrCollection, response) {
        function normalizeId(attributes) {
            if(attributes.id) {
                attributes.id = parseInt(attributes.id, 10) || attributes.id;
            }
            return attributes;
        }

        if (response) {
            return response.attributes ? response.attributes : response;
        } else if (modelOrCollection instanceof Backbone.Model) {
            return normalizeId(modelOrCollection.attributes);
        } else if (modelOrCollection instanceof Backbone.Collection) {
            return _.map(modelOrCollection.models, function(model) { return normalizeId(model.attributes); });
        } else {
            return [];
        }
    },

    completeFetchFor: function(model, response, options, pagination) {
        var triggerChangeManually = !response;
        response = this.makeFakeResponse(model, response);
        var fetch = this.lastFetchFor(model, options);
        if (fetch) {
            fetch.succeed(response, pagination);
            if(triggerChangeManually) { model.trigger("change");}
        } else {
            throw "No fetch found for " + model.url() + ". Found fetches for: [" + _.pluck(this.fetches(), 'url').join(', ') + "]";
        }
    },

    completeUpdateFor: function(model, response, pagination) {
        response = this.makeFakeResponse(model, response);
        var update = this.lastUpdateFor(model);
        if (update) {
            update.succeed(response, pagination);
        } else {
            throw "No update found for " + model.url() + ". Found updates for: [" + _.pluck(this.creates(), 'url').join(', ') + "]";
        }
    },

    completeCreateFor: function(model, response) {
        response = this.makeFakeResponse(model, response);
        var create = this.lastCreateFor(model);
        if (create) {
            create.succeed(response);
        } else {
            throw "No create found for " + model.url() + ". Found creates for: [" + _.pluck(this.creates(), 'url').join(', ') + "]";
        }
    },

    completeDestroyFor: function(model, response) {
        var destroy = this.lastDestroyFor(model);
        if (destroy) {
            destroy.succeed({});
        } else {
            throw "No destroy found for " + model.url() + ". Found destroys for: [" + _.pluck(this.destroys(), 'url').join(', ') + "]";
        }
    },

    completeFetchAllFor: function(model, results, options, pagination) {
        options = options || {};
        options = _.extend({page: 1, per_page: 1000}, options);
        pagination = pagination || {};
        pagination = _.extend({page: 1, total: 1, records: results ? results.length : 1}, pagination);
        this.completeFetchFor(model, results, options, pagination);
    },

    completeAllFetches: function(pagination) {
        pagination = pagination || {page: 1, total: 1, records: 1};
        _.each(this.fetches(), function(request) {
            request.succeed([], pagination);
        });
    }
});


_.extend(sinon.FakeXMLHttpRequest.prototype, {
    respondJson: function(responseCode, json) {
        return this.respond(
            responseCode,
            { 'Content-Type': 'application/json' },
            JSON.stringify(json));
    },

    succeed: function(models, pagination) {
        var isArray = _.isArray(models);
        if (!isArray) models = [models];
        var resource = _.map(models, function(model) {
            if (model instanceof Backbone.Model) {
                return model.attributes;
            } else {
                return model;
            }
        });

        if (!isArray) { resource = resource[0]; }

        return this.respondJson(200, {
            response: resource,
            pagination: pagination
        });
    },

    fail: function fail(message, resource) {
        return this.respondJson(400, {
            status: "fail",
            resource: resource || [],
            message: message || "something went wrong!"
        });
    },

    failNotFound: function(errors) {
        return this.respondJson(404, {
            errors: errors || {}
        });
    },

    failForbidden: function(errors) {
        return this.respondJson(403, {
            errors: errors || {}
        });
    },

    failUnprocessableEntity: function(errors) {
        return this.respondJson(422, {
            errors: errors || {}
        });
    },

    failUnauthorized: function(errors) {
        return this.respondJson(401, {
            errors: errors || {}
        });
    },

    failServerError: function(errors) {
        return this.respondJson(500, {
            errors: errors || {}
        });
    },

    params: function() {
        var uri;
        if (this.requestBody) {
            uri = new URI("?" + this.requestBody);
        } else {
            uri = new URI(this.url);
        }

        return uri.search(true);
    },

    json: function () {
        return JSON.parse(this.requestBody);
    },

    error: function(message) {
        return this.respond(
            404,
            {},
            ''
        );
    }
});
