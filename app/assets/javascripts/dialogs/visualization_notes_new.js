chorus.dialogs.VisualizationNotesNew = chorus.dialogs.MemoNew.extend({
    constructorName: "VisualizationNotesNew",

    title:t("notes.new_dialog.title"),
    submitButton: t("notes.button.create"),

    makeModel:function () {
        this.model = new chorus.models.Note({
            entityId:this.options.entityId,
            entityType:this.options.entityType,
            workspaceId: this.options.workspaceId
        });
        var subject = this.model.get("entityType");

        this.placeholder = t("notes.placeholder", {noteSubject: subject});
        this._super("makeModel", arguments);
    },

    postRender: function() {
        this._super("postRender", arguments);

        this.showOptions();
        this.showVisualizationData();
    },

    showVisualizationData: function() {
        var $row = $(Handlebars.helpers.renderTemplate("notes_new_file_attachment").toString());
        this.$(".options_area").append($row);

        var visualization = this.options.attachVisualization;

        var iconSrc = "images/workfiles/icon/img.png";
        $row.find('img.icon').attr('src', iconSrc);
        $row.find('span.name').text(visualization.fileName).attr('title', visualization.fileName);
        $row.data("visualization", visualization);
        $row.find(".removeWidget").addClass("hidden");
        $row.removeClass("hidden");
        $row.addClass("visualization file_details");
    },

    modelSaved: function() {
        var note = this.model;
        var svgFile = new chorus.models.Base(this.options.attachVisualization);
        svgFile.url = function() {
             // weirdly, the note knows how to generate urls for its attachments;
            return note.url({isFile: true});
        };
        svgFile.bind("saved", this.svgSaved, this);
        svgFile.save();

        this._super("modelSaved");
    },

    svgSaved: function() {
        chorus.toast("dataset.visualization.note_from_chart.toast", {datasetName: this.options.entityName, toastOpts: {type: "success"}});
    }
});
