chorus.dialogs.VerifyChorusView = chorus.dialogs.SqlPreview.extend({
    constructorName: "VerifyChorusView",

    templateName: "verify_chorus_view",
    title: t("dataset.verify_chorus_view.title"),
    additionalClass: "sql_preview dialog_wide",

    persistent: true,

    events: {
        "click button.edit": "makeEditable"
    },

    setup: function() {
        this._super("setup");
        this.events = _.clone(this.events);
        _.extend(this.events, {
            "submit form": "nameChorusView"
        });
    },

    nameChorusView: function(e) {
        e.preventDefault();

        this.model.set({ query: this.sql() });

        var assignNameDialog = new chorus.dialogs.NameChorusView({
            model: this.model
        });
        this.launchSubModal(assignNameDialog);
    },

    sql: function() {
        return this.editor.getValue();
    },

    makeEditable: function(e) {
        e && e.preventDefault();

        this.editor.setOption("readOnly", false);
        this.editor.setOption("theme", "default editable");

        $(e.target).addClass("disabled");
    }
});
