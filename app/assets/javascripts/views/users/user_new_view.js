chorus.views.UserNew = chorus.views.Base.extend({
    templateName:"user/new",

    events:{
        "submit form":'submitNewUser',
        "click button.cancel": "goBack"
    },

    persistent:true,

    setup:function () {
        this.listenTo(this.model, "saved", this.userSaved);
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.User();
    },

    postRender: function() {
        this.$("textarea").limitMaxlength();
    },

    submitNewUser:function submitNewUser(e) {
        e.preventDefault();
        if(this.saving) {return;}
        this.saving = true;

        delete this.model.serverErrors;
        this.clearErrors();

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

        this.model.set(updates);

        this.model.id = undefined; // since User#idAttribute is username, we need this for isNew to return true
        this.model.save();
    },

    goBack:function () {
        window.history.back();
    },

    showErrors: function() {
        this._super("showErrors", arguments);
        this.saving = false;
    },

    userSaved: function() {
        chorus.router.navigate("/users");
    }
});
