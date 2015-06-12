(function() {
    function userSuccessfullySaved() {
        chorus.router.navigate("/users");
    }

    chorus.views.UserNewLdap = chorus.views.Base.extend({
        templateName: "user/new_ldap",
        additionalClass: "user_new",

        persistent: true,

        events : {
            "submit form": "formSubmitted",
            "click button.cancel": "goBack",
            "click button#check_username": "checkUsernameClicked"
        },

        setup: function() {
            this.model.ldap = true;
            this.listenTo(this.model, "saved", userSuccessfullySaved);
        },

        postRender: function() {
            this.$("textarea").limitMaxlength();
        },

        checkUsernameClicked: function(e) {
            e.preventDefault();
            this.clearErrors();
            this.disableCheckUsernameButton();
            this.checkUsername(this.ldapUsersFetched);
        },

        disableCheckUsernameButton: function(){
            this.$("button#check_username").prop("disabled", true);
        },

        enableCheckUsernameButton: function() {
            this.$("button#check_username").prop("disabled", false);
        },

        formSubmitted: function(e) {
            e.preventDefault();
            if(this.saving) {return;}
            this.saving = true;
            this.submitNewUser();
        },

        checkUsername: function(callback) {
            var username = this.$("input[name=username]").val();
            this.collection = new chorus.collections.LdapUserSet([], { username: username });

            this.collection.fetch({
                error: this.showLdapServerError,
                complete: this.enableCheckUsernameButton.bind(this)
            });

            this.listenTo(this.collection, "reset", function() {
                if (this.collection.models.length > 0) {
                    callback.call(this);
                } else {
                    this.noLdapUserFound();
                }
            });
        },

        ldapUsersFetched: function() {
            var model = this.collection.first();
            this.$("input[name='firstName']").val(model.get("firstName"));
            this.$("input[name='lastName']").val(model.get("lastName"));
            this.$("input[name='email']").val(model.get("email"));
            this.$("input[name='title']").val(model.get("title"));
            this.$("input[name='dept']").val(model.get("dept"));
        },

        showLdapServerError: function(collection, response, options){
            var error_json = JSON.parse(response.responseText);
            var alert = new chorus.alerts.Error({ body: error_json.errors.message, title: "LDAP configuration error" });
            alert.launchModal();
        },

        noLdapUserFound: function() {
            var alert = new chorus.alerts.NoLdapUser({ username: this.collection.attributes.username });
            alert.launchModal();
        },

        submitNewUser: function() {
            this.model.save(this.fieldValues(), { method: "create" });
        },

        fieldValues: function() {
            var updates = {};
            _.each(this.$("input, textarea"), function (i) {
                var input = $(i);
                var val = input.val();
                if (input.is("input")) {
                    val = val.trim();
                }
                updates[input.attr("name")] = val;
            });
            updates.admin = this.$("input#admin-checkbox").prop("checked") || false;
            updates.developer = this.$("input#developer-checkbox").prop("checked") || false;
            return updates;
        },

        goBack: function() {
            window.history.back();
        },

        showErrors: function() {
            this._super("showErrors", arguments);
            this.saving = false;
        }
    });
})();

