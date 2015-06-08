chorus.dialogs.ImportGnipStream = chorus.dialogs.Base.extend({
    templateName: "import_gnip_stream",
    title: t("gnip.import_stream.title"),

    events: {
        "click a.select_workspace" : "launchWorkspacePicker",
        "click .submit" : "saveModel",
        "keyup input[name=toTable]" : "enableSubmitButton",
        "paste input[name=toTable]" : "enableSubmitButton"
    },

    setup: function() {
        this.listenTo(this.model, "saveFailed", this.saveFailed);
        this.listenTo(this.model, "saved", this.saved);
        this.listenTo(this.model, "validationFailed", this.saveFailed);
    },

    makeModel: function() {
        this._super("makeModel", arguments);
        this.resource = this.model = new chorus.models.GnipStream();
        this.gnip = this.pageModel;
        this.model.set({gnip_data_source_id: this.gnip.id});
    },

    postRender: function() {
        this.$(".submit").attr("disabled", "disabled");
    },

    launchWorkspacePicker: function() {
        this.workspace_picker = new chorus.dialogs.ImportStreamWorkspacePicker();
        this.workspace_picker.launchModal();
        this.listenTo(this.workspace_picker, "workspace:selected", this.workspaceSelected);
    },

    workspaceSelected: function(workspace){
        this.workspace = workspace;
        this.$("a.select_workspace").text(this.workspace.name());
        this.$("a.select_workspace").attr("title", this.workspace.name());
        this.enableSubmitButton();
    },

    saveModel: function() {
        this.setFieldValues();
        this.$("button.submit").startLoading("loading");
        this.model.save();
    },

    enableSubmitButton: function() {
        if (this.workspace && this.$("input[name=toTable]").val().trim()) {
            this.$(".submit").removeAttr("disabled");
        } else {
            this.$(".submit").attr("disabled", "disabled");
        }
    },

    setFieldValues: function() {
        this.model.set({
            workspaceId: this.workspace && this.workspace.id,
            toTable: this.$("input[name=toTable]").val()
        }, {silent: true});
    },

    saved: function() {
        this.closeModal();
        chorus.toast("gnip.import_stream.start_import.toast", {toastOpts: {type: "info"}});
    }
});